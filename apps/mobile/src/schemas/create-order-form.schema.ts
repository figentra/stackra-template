/**
 * Stackra file contract:
 * Purpose: the create-order sheet's form: one order line as the action takes it, plus the loyalty
 *          points to redeem.
 * Boundary: extends the action's own line shape (`RequestedLine` from the generated client, built
 *           from commerce's committed manifest), never re-declared, so a change to the action's
 *           line reaches the form at gen time. The action re-validates on the server; a queued
 *           offline call is already well formed when it replays. The sheet's hook folds the form
 *           back into the action's input.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0055, ADR 0059
 */
import { Int } from "@stackra/validation";
import { RequestedLine } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/** The line's `variantId` and `quantity` with the action's bounds, plus `redeemPoints`. */
export class CreateOrderForm extends RequestedLine {
  /** Loyalty points to redeem, folded into `extensions.loyalty`; zero means "not entered". */
  @Int({
    min: 0,
    message: I18n.mobile.create_order.errors.points_min,
  })
  redeemPoints = 0;
}
