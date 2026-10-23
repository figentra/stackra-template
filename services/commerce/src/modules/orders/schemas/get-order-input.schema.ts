/**
 * Stackra file contract:
 * Purpose: `GetOrderInput`: the order `orders.order.get@1` reads, by public id.
 * Boundary: a shape class in schemas/, one declaration per file. The field is the record id the
 *           panel binds from a row when it opens the View page.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The order to read, by public id. */
export class GetOrderInput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;
}
