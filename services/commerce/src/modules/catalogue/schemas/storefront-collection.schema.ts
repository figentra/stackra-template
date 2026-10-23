/**
 * Stackra file contract:
 * Purpose: `StorefrontCollection`: one storefront collection a product is listed in, as a title and
 *          a slug.
 * Boundary: a shape class in schemas/ because the Product model (a jsonb element) and the product
 *           page both use it. The pair is denormalised on the product until a collections module
 *           exists.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import { Schema } from "@stackra/validation";

/** The collection's display title and URL segment. */
export class StorefrontCollection extends Schema {
  /** The collection's display title. */
  title!: string;

  /** The collection's URL segment; the grid filters on it. */
  slug!: string;
}
