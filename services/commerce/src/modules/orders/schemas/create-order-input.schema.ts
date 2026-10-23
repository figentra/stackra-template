/**
 * Stackra file contract:
 * Purpose: `CreateOrderInput`: one to a hundred requested lines and `extensions`, which gen types
 *          per extending module (`extensions.loyalty.redeemPoints`).
 * Boundary: a shape class in schemas/ rather than a companion of the action, because the action,
 *           CreateOrderWorkflow and OrderPricingService all read it. The customer is the actor,
 *           never a field.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 8 and 13), ADR 0136 (actor from context), ADR 0265
 */
import type { Json } from "@stackra/contracts";
import { List, Schema } from "@stackra/validation";
import type { RequestedLine } from "#modules/orders/schemas/requested-line.schema";

/** What a caller sends to `orders.order.create`. */
export class CreateOrderInput extends Schema {
  /** The variants and quantities to order. */
  @List({
    min: 1,
    max: 100,
  })
  lines!: RequestedLine[];

  /** Each extending module's own input, keyed by its module key. */
  extensions: Record<string, Json> = {};
}
