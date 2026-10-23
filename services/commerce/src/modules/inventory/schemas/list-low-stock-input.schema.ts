/**
 * Stackra file contract:
 * Purpose: `ListLowStockInput`: the input of `inventory.stock.list_low@1`: how many levels to
 *          return, lowest stock first.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Int, Schema } from "@stackra/validation";

/** How many levels to return, lowest stock first. */
export class ListLowStockInput extends Schema {
  /** Levels per call; the widget asks for 5. */
  @Int({
    min: 1,
    max: 100,
  })
  limit = 20;
}
