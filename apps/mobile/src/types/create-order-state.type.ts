/**
 * Stackra file contract:
 * Purpose: what the create-order sheet renders from and calls: the form, the pending flag and the
 *          submit that reports whether the call ran or was queued.
 * Boundary: a type only; `useCreateOrder` returns it and the `CreateOrder` page reads it.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: one
 *                     declaration per file), ADR 0059, ADR 0139
 */
import type { PublicId } from "@stackra/contracts";
import type { SchemaForm } from "@stackra/ui/native";
import type { CreateOrderForm } from "#src/schemas/create-order-form.schema";

/** The result of `useCreateOrder`. */
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
