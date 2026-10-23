/**
 * Stackra file contract:
 * Purpose: `SearchProductsInput`: the input of `catalogue.product.search@1`: the storefront search
 *          phrase, collection, cursor and page size.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { CursorInput, Str } from "@stackra/validation";

/** `cursor` and `limit` (1–100, default 20) come from CursorInput. */
export class SearchProductsInput extends CursorInput {
  /** The search phrase, 2 to 64 characters. */
  @Str({
    min: 2,
    max: 64,
  })
  q!: string;

  /** A collection slug to search within. */
  @Str({ max: 200 })
  collection?: string;
}
