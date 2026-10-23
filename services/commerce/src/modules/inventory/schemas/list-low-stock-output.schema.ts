/**
 * Stackra file contract:
 * Purpose: `ListLowStockOutput`: the output of `inventory.stock.list_low@1`: the levels at or below
 *          the threshold; LowStockWidget lists its `items`.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Schema } from "@stackra/validation";
import type { LowStockItem } from "#modules/inventory/schemas/low-stock-item.schema";

/** The levels, lowest stock first. */
export class ListLowStockOutput extends Schema {
  /** Every level at or below the threshold, up to `limit`. */
  items!: LowStockItem[];
}
