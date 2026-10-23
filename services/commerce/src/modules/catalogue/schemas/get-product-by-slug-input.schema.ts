/**
 * Stackra file contract:
 * Purpose: `GetProductBySlugInput`: the input of `catalogue.product.get_by_slug@1`: the storefront
 *          URL segment of the product to read.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Schema, Str } from "@stackra/validation";

/** The product to read, by its tenant-unique slug. */
export class GetProductBySlugInput extends Schema {
  /** The storefront URL segment. */
  @Str({ max: 200 })
  slug!: string;
}
