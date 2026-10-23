/**
 * Stackra file contract:
 * Purpose: `StorefrontProductView`: the product page: every variant priced, the images, the
 *          rich-text description document, the seo values and the collections it sits in.
 * Boundary: a shape class in schemas/ because StorefrontService builds it and the public slug query
 *           returns it. The description is the merchant's document (L2), rendered by the experience
 *           renderer, never HTML.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26), ADR 0082 (public area)
 */
import type { Json, PublicId } from "@stackra/contracts";
import type { CurrencyCode } from "@stackra/money";
import { Schema } from "@stackra/validation";
import type { StorefrontCollection } from "#modules/catalogue/schemas/storefront-collection.schema";
import type { StorefrontImage } from "#modules/catalogue/schemas/storefront-image.schema";
import type { StorefrontSeo } from "#modules/catalogue/schemas/storefront-seo.schema";
import type { StorefrontVariant } from "#modules/catalogue/schemas/storefront-variant.schema";

/** Everything the web storefront renders a product page from, in one call. */
export class StorefrontProductView extends Schema {
  /** The product's public id. */
  id!: PublicId<"prd">;

  /** The title in the request locale. */
  title!: string;

  /** The URL segment. */
  slug!: string;

  /** ISO 4217 code of every variant price. */
  currency!: CurrencyCode;

  /** True when at least one variant is in stock. */
  inStock!: boolean;

  /** The images in display order. */
  images!: StorefrontImage[];

  /** The description document in the request locale; null when the merchant wrote none. */
  description!: Json | null;

  /** Every variant, priced for the request's market. */
  variants!: StorefrontVariant[];

  /** The resolved page title, meta description and indexing switch. */
  seo!: StorefrontSeo;

  /** The collections the product is listed in. */
  collections!: StorefrontCollection[];
}
