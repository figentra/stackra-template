/**
 * Stackra file contract:
 * Purpose: `RedeemPointsRequest`: the typed input loyalty adds to `orders.order.create@1` as
 *          `extensions.loyalty`.
 * Boundary: a shape class, the `input` of RedeemPointsExtension. Gen merges it into the action's
 *           input schema, openapi.json and every generated client, so a caller sees
 *           `extensions: { loyalty?: { redeemPoints: number } }` without orders knowing loyalty
 *           exists. Named `Request`, not `Extension`, so it never collides with the extension
 *           class.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26), ADR 0265 (typed extensions)
 */
import { Int, Schema } from "@stackra/validation";

/** How many points the customer wants to spend on this order. */
export class RedeemPointsRequest extends Schema {
  /** Points to spend; the extension caps them by balance and by the kit's percentage. */
  @Int({
    min: 1,
    max: 1_000_000,
  })
  redeemPoints!: number;
}
