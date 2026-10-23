/**
 * Stackra file contract:
 * Purpose: `ListStorefrontProductsInput`: the input of `catalogue.product.list_storefront@1`: the
 *          storefront grid's cursor, page size, phrase and collection.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { CursorInput, Str } from "@stackra/validation";

/** `cursor` and `limit` (1–100, default 20) come from CursorInput. */
export class ListStorefrontProductsInput extends CursorInput {
  /** A search phrase; the product's hybrid index ranks the matches (ADR 0221). */
  @Str({ max: 200 })
  search?: string;

  /** A collection slug; only products listed in that collection are returned. */
  @Str({ max: 200 })
  collection?: string;
}
