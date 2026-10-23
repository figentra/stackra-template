/**
 * Stackra file contract:
 * Purpose: `SearchVariantsOutput`: the output of `catalogue.variant.search@1`: the variant hits in
 *          rank order.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Schema } from "@stackra/validation";
import type { VariantHit } from "#modules/catalogue/schemas/variant-hit.schema";

/** The hits, best match first. */
export class SearchVariantsOutput extends Schema {
  /** The matching variants in rank order. */
  items!: VariantHit[];
}
