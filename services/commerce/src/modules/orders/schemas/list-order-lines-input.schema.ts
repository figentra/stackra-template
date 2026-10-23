/**
 * Stackra file contract:
 * Purpose: `ListOrderLinesInput`: the order whose lines `orders.order.list_lines@1` reads.
 * Boundary: a shape class in schemas/, one declaration per file. Its parent id is what makes the
 *           query usable as OrderResource's Lines relation: the panel binds `orderId` from the
 *           record.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The order to read the lines of, by public id. */
export class ListOrderLinesInput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;
}
