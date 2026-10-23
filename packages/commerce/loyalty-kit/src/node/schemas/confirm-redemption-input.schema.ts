/**
 * Stackra file contract:
 * Purpose: `ConfirmRedemptionInput`: the input of `loyalty_kit.points.confirm_redemption@1`: the
 *          reference of the redemption to confirm.
 * Boundary: a shape class in its own file; the member is the actor (or the customer a service acts
 *           for), never a field.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0136
 */
import { Schema, Str } from "@stackra/validation";

/** The same reference the caller passed to `loyalty_kit.points.redeem`. */
export class ConfirmRedemptionInput extends Schema {
  /** Public id of the thing paid for (`ord_…`); the path parameter of the endpoint. */
  @Str({
    min: 1,
    max: 120,
  })
  reference!: string;
}
