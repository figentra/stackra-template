/**
 * Stackra file contract:
 * Purpose: `StorefrontImage`: one product image as stored on the product and as the storefront
 *          renders it.
 * Boundary: a shape class in schemas/ because the Product model (a jsonb element), the product page
 *           and the grid card all use it. `alt` is null when the merchant left it empty, and the
 *           renderer falls back to the title.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import { Schema } from "@stackra/validation";

/** The image's public URL and its alternative text. */
export class StorefrontImage extends Schema {
  /** The public URL @stackra/media returned when the upload was claimed. */
  url!: string;

  /** The text a screen reader announces; null falls back to the product title. */
  alt!: string | null;
}
