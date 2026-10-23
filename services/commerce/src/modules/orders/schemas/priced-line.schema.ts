/**
 * Stackra file contract:
 * Purpose: `PricedLine`: a requested line with the unit price the pricing service quoted for it,
 *          in minor units; also how OrderView lists a stored line.
 * Boundary: a shape class that extends RequestedLine; gen compiles the inherited fields too. The
 *           price is integer minor units on the wire (ADR 0220); the model stores it as `Money`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26), ADR 0220 (integer minor units)
 */
import { Int } from "@stackra/validation";
import { RequestedLine } from "#modules/orders/schemas/requested-line.schema";

/** A line with its unit price, in the minor units of the order's currency. */
export class PricedLine extends RequestedLine {
  /** Price of one unit, in minor units. */
  @Int
  unitPriceMinor!: number;
}
