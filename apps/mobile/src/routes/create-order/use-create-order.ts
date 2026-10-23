/**
 * Stackra file contract:
 * Purpose: the form state and the submit: validates with `CreateOrderForm`, folds the form back
 *          into the action's input, calls the action through the generated client, and tells the
 *          caller whether the call ran or was queued for later.
 * Boundary: used by the create-order page, so it sits in its route folder. The action is queued
 *           offline in `#stackra/offline`, so `run` resolves with `{ queued: true }` without a
 *           connection, and the Idempotency-Key is minted once, so the replay is the same call.
 *           The points travel in `extensions.loyalty` only when entered.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0055, ADR 0059, ADR 0139, ADR 0252
 */
import type { ActionInput } from "@stackra/clients";
import { useAction } from "@stackra/clients/react";
import type { PublicId } from "@stackra/contracts";
import { type SchemaForm, useSchemaForm } from "@stackra/ui/native/form";
import { CreateOrderForm } from "#src/schemas/create-order-form.schema";
import { Commerce } from "#stackra/clients";

/** What the sheet renders from and calls. */
export interface CreateOrderState {
  /** The form object the adapter's `Form` and `Field.*` bind to. */
  readonly form: SchemaForm<CreateOrderForm>;
  /** Whether the action is in flight (never true for a queued call: it returns at once). */
  readonly isPending: boolean;
  /**
   * Validates, then runs the action.
   * @returns `undefined` when validation failed (errors are on the fields); `{ queued: true }` when
   *          offline and held in the outbox; `{ orderId }` when the server answered.
   * @throws ClientError with the refusal (`variant_unavailable`, `insufficient_stock`) when online
   *          and refused.
   */
  readonly submit: () => Promise<{ queued: true } | { orderId: PublicId<"ord"> } | undefined>;
}

/**
 * The action's input from a validated form: the one line, and the points only when entered, so no
 * loyalty extension travels and the server applies no redemption at zero.
 */
function toInput(form: CreateOrderForm): ActionInput<typeof Commerce.actions.CreateOrder> {
  return {
    lines: [{ variantId: form.variantId, quantity: form.quantity }],
    extensions: form.redeemPoints > 0 ? { loyalty: { redeemPoints: form.redeemPoints } } : {},
  };
}

/**
 * The form hook.
 * @param initialVariantId - pre-fills the variant when the sheet opens from the scanner
 */
export function useCreateOrder(initialVariantId?: PublicId<"var">): CreateOrderState {
  const create = useAction(Commerce.actions.CreateOrder, {
    invalidates: [Commerce.queries.ListOrders],
  });
  const form = useSchemaForm(CreateOrderForm, {
    defaultValues: {
      quantity: 1,
      redeemPoints: 0,
      ...(initialVariantId ? { variantId: initialVariantId } : {}),
    },
  });

  return {
    form,
    isPending: create.isPending,
    submit: form.handleSubmit(async (values) => {
      const result = await create.run(toInput(values));
      return result.queued ? { queued: true as const } : { orderId: result.data.orderId };
    }),
  };
}
