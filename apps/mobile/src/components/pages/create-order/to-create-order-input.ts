/**
 * Stackra file contract:
 * Purpose: folds the create-order form back into the action's input: the one line into `lines`, the
 *          points into `extensions.loyalty` only when entered.
 * Boundary: a pure function used by the sheet's hook; it exists only because the form has a UI-only
 *           field.
 * Runtime: isomorphic
 * Governing contract: ADR 0055
 */
import type { ActionInput } from "@stackra/clients";
import type { CreateOrderForm } from "#src/schemas/create-order.schema";
import type { Commerce } from "#stackra/clients";

/**
 * Maps a validated form to `Commerce.actions.CreateOrder`'s input.
 * @param form - a value that passed {@link CreateOrderForm}
 */
export function toCreateOrderInput(
  form: CreateOrderForm,
): ActionInput<typeof Commerce.actions.CreateOrder> {
  return {
    lines: [{ variantId: form.variantId, quantity: form.quantity }],
    extensions: form.redeemPoints > 0 ? { loyalty: { redeemPoints: form.redeemPoints } } : {},
  };
}
