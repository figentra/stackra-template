/**
 * Stackra file contract:
 * Purpose: `ArchiveProductInput`: the input of `catalogue.product.archive@1`: the product to
 *          archive; its only field is the record id, so ProductResource places the action on the
 *          row and the View header, and `.bulk()` fans it out per product.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The product to archive, by public id. */
export class ArchiveProductInput extends Schema {
  /** The product's public id. */
  productId!: PublicId<"prd">;
}
