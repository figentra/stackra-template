/**
 * Stackra file contract:
 * Purpose: `StorefrontSeo`: a product page's title, meta description and indexing switch.
 * Boundary: a shape class in schemas/ because the Product model (the merchant's overrides, jsonb)
 *           and the product page (the resolved values) both use it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import { Schema } from "@stackra/validation";

/** A null title or description falls back to the product's own text. */
export class StorefrontSeo extends Schema {
  /** The page title; null uses the product title. */
  title!: string | null;

  /** The meta description; null leaves it out. */
  description!: string | null;

  /** Keeps the product out of the sitemap and asks search engines not to index the page. */
  noindex!: boolean;
}
