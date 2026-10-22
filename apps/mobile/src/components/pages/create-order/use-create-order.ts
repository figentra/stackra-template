/**
 * Stackra file contract:
 * Purpose: the form state and the submit: validates with `CreateOrderForm`, calls the action
 *          through the generated client, and tells the caller whether the call ran or was queued
 *          for later. Used by one page.
 * Boundary: the action is `OfflineMode.Queue` in `#stackra/offline`, so `run` resolves with `{
 *           queued: true }` without a connection and the Idempotency-Key is minted once, so the
 *           replay is the same call.
 * Runtime: react-native
 * Governing contract: ADR 0059, ADR 0139, ADR 0252
 */
import { useAction } from "@stackra/clients/react";
import { useSchemaForm, type SchemaForm } from "@stackra/ui/native/form";
import { toCreateOrderInput } from "#src/components/pages/create-order/to-create-order-input";
import { CreateOrderForm } from "#src/schemas/create-order.schema";
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
  readonly submit: () => Promise<{ queued: true } | { orderId: string } | undefined>;
}

/**
 * The form hook.
 * @param initialVariantId - pre-fills the variant when the sheet opens from the scanner
 */
export function useCreateOrder(initialVariantId?: string): CreateOrderState {
  const create = useAction(Commerce.actions.CreateOrder, {
    invalidates: [Commerce.queries.ListOrders],
  });
  const form = useSchemaForm(CreateOrderForm, {
    defaultValues: { variantId: initialVariantId ?? "", quantity: 1, redeemPoints: 0 },
  });

  return {
    form,
    isPending: create.isPending,
    submit: form.handleSubmit(async (values) => {
      const result = await create.run(toCreateOrderInput(values));
      return result.queued ? { queued: true as const } : { orderId: result.data.orderId };
    }),
  };
}
