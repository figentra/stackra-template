/**
 * Stackra file contract:
 * Purpose: `OrderAdjustment`: one amount an `adjustTotals` extension added to or took off an order.
 * Boundary: a shape class; stored as an element of the order's `adjustments` jsonb column and sent
 *           inside OrderTotals. Integer minor units (ADR 0220).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26), ADR 0220 (integer minor units)
 */
import { Int, Schema } from "@stackra/validation";

/** `amountMinor` is negative for a discount. */
export class OrderAdjustment extends Schema {
  /** A code owned by the module that added it, such as `loyalty_points`. */
  code!: string;

  /** The i18n key of the line a person reads. */
  label!: string;

  /** The amount added, in minor units of the order's currency. */
  @Int
  amountMinor!: number;
}
