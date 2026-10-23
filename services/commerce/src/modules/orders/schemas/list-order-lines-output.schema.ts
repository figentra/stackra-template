/**
 * Stackra file contract:
 * Purpose: `ListOrderLinesOutput`: the packing-slip lines of one order with the catalogue facts a
 *          packer needs.
 * Boundary: a shape class in schemas/, one declaration per file. Its `lines` are the rows of the
 *           Lines relation table on the order's View page.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Schema } from "@stackra/validation";
import type { OrderLineDetail } from "#modules/orders/schemas/order-line-detail.schema";

/** Each line with the variant's SKU and whether it still tracks inventory. */
export class ListOrderLinesOutput extends Schema {
  /** The packing-slip lines. */
  lines!: OrderLineDetail[];
}
