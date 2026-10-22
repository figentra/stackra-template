/**
 * Stackra file contract:
 * Purpose: the create-order sheet's form schema: one order line as the action takes it, plus the
 *          loyalty points to redeem.
 * Boundary: derived from `Commerce.actions.CreateOrder.input`, never re-declared, so a change to
 *           the action's line shape reaches the form at gen time. The action re-validates on the
 *           server; a queued offline call is already well-formed when it replays. The fold back
 *           into the action input is `toCreateOrderInput`.
 * Runtime: isomorphic
 * Governing contract: ADR 0055, ADR 0059, ADR 0095
 */
import { Schema, z } from "@stackra/schema";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/** One line of the action's input: `variantId` and `quantity`, with the action's own bounds. */
const OrderLine = Commerce.actions.CreateOrder.input.shape.lines.element;

/**
 * The form fields: the line plus `redeemPoints`, a UI-only field folded into `extensions.loyalty`.
 */
export class CreateOrderForm extends Schema(
  OrderLine.extend({
    /** Loyalty points to redeem; zero means "not entered". */
    redeemPoints: z.number().int().min(0, I18n.mobile.create_order.errors.points_min).default(0),
  }),
) {}
