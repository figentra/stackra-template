/**
 * Stackra file contract:
 * Purpose: `AttachProductImageInput`: the input of `catalogue.product.attach_image@1`: the product,
 *          the finished upload and its alternative text; the record id plus other fields, so the
 *          panel opens a modal form for the rest. Never bytes: an `Upload` token.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import type { Upload } from "@stackra/media";
import { Schema, Str } from "@stackra/validation";
import type { ProductImagesBucket } from "#modules/catalogue/models/product-images.bucket";

/** The product, the finished upload and its alternative text. */
export class AttachProductImageInput extends Schema {
  /** The product's public id. */
  productId!: PublicId<"prd">;

  /** A token for a file the client already put through a signed URL of the bucket; never bytes. */
  image!: Upload<ProductImagesBucket>;

  /** The text a screen reader announces; null falls back to the product title. */
  @Str({ max: 200 })
  alt!: string | null;
}
