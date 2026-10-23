/**
 * Stackra file contract:
 * Purpose: `OrderTotals`: the money summary of an order in one currency: subtotal, the adjustments
 *          in the order they were applied, and the total the customer pays (subtotal plus
 *          adjustments, clamped at zero by OrderPricingService).
 * Boundary: a shape class; the wire carries integer minor units and the currency code (ADR 0220),
 *           while the model stores each amount as `Money`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26), ADR 0220 (integer minor units)
 */
import type { CurrencyCode } from "@stackra/money";
import { Int, Schema } from "@stackra/validation";
import type { OrderAdjustment } from "#modules/orders/schemas/order-adjustment.schema";

/** Every amount is in `currency`. */
export class OrderTotals extends Schema {
  /** ISO 4217 code of every amount below. */
  currency!: CurrencyCode;

  /** Sum of line prices before adjustments, in minor units. */
  @Int({ min: 0 })
  subtotalMinor!: number;

  /** What the `adjustTotals` extensions applied, in the order they ran. */
  adjustments!: OrderAdjustment[];

  /** Amount charged, in minor units; never below zero. */
  @Int({ min: 0 })
  totalMinor!: number;
}
