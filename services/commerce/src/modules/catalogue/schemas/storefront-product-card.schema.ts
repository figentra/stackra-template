/**
 * Stackra file contract:
 * Purpose: `StorefrontProductCard`: the grid card: the lowest variant price and the first image.
 * Boundary: a shape class in schemas/ because StorefrontService builds it and StorefrontProductPage
 *           pages it. The price is integer minor units (ADR 0220).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26), ADR 0220 (integer minor units)
 */
import type { PublicId } from "@stackra/contracts";
import type { CurrencyCode } from "@stackra/money";
import { Int, Schema } from "@stackra/validation";
import type { StorefrontImage } from "#modules/catalogue/schemas/storefront-image.schema";

/** One product in the storefront grid. */
export class StorefrontProductCard extends Schema {
  /** The product's public id. */
  id!: PublicId<"prd">;

  /** The title in the request locale. */
  title!: string;

  /** The URL segment the card links to. */
  slug!: string;

  /** The lowest variant price for the request's market, in minor units. */
  @Int
  priceMinor!: number;

  /** ISO 4217 code of `priceMinor`. */
  currency!: CurrencyCode;

  /** The first image; null when the product has none. */
  image!: StorefrontImage | null;

  /** Whether at least one variant can be sold now. */
  inStock!: boolean;
}
