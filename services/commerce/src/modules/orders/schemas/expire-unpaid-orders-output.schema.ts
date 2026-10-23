/**
 * Stackra file contract:
 * Purpose: `ExpireUnpaidOrdersOutput`: how many orders one run of `orders.order.expire_unpaid@1`
 *          expired.
 * Boundary: a shape class in schemas/, one declaration per file; zero is a normal result.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Int, Schema } from "@stackra/validation";

/** How many orders this run expired; zero is normal. */
export class ExpireUnpaidOrdersOutput extends Schema {
  /** Orders moved to `expired`. */
  @Int({ min: 0 })
  expired!: number;
}
