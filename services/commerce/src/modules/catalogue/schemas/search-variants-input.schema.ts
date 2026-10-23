/**
 * Stackra file contract:
 * Purpose: `SearchVariantsInput`: the input of `catalogue.variant.search@1`: what was typed at the
 *          POS and how many hits to return.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Int, Schema, Str } from "@stackra/validation";

/** A SKU, barcode or title prefix typed at the POS. */
export class SearchVariantsInput extends Schema {
  /** What was typed, 2 to 64 characters. */
  @Str({
    min: 2,
    max: 64,
  })
  q!: string;

  /** Hits to return; at most 50. */
  @Int({
    min: 1,
    max: 50,
  })
  limit = 10;
}
