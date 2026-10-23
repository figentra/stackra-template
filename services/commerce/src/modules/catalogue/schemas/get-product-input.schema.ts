/**
 * Stackra file contract:
 * Purpose: `GetProductInput`: the input of `catalogue.product.get@1`: the product to read, by
 *          public id; ProductResource's View page binds it from the record.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The product to read, by public id. */
export class GetProductInput extends Schema {
  /** The product's public id. */
  productId!: PublicId<"prd">;
}
