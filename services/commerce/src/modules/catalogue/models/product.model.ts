/**
 * Stackra file contract:
 * Purpose: the Product model: what is sold, in which variants, in which state.
 * Boundary: data shape, invariants and recorded events only; no price, no stock (other modules and
 *           services own those). Storefront fields (description, images, collections, seo) are data
 *           the merchant edits; the public view adds price and stock.
 * Runtime: node
 * Governing contract: ADR 0095, 0096, 0133 (traits), guides/programming-model.mdx#models
 */
import {
  HasMany,
  HasState,
  Index,
  Json,
  Model,
  Nullable,
  Str,
  type Translated,
} from "@stackra/model";
import { StorefrontImage } from "#modules/catalogue/schemas/storefront-image.schema";
import {
  BelongsToTenant,
  HasPublicId,
  Timestamps,
  Translatable,
  Versioned,
} from "@stackra/model/traits";
import { Variant } from "#modules/catalogue/models/variant.model";
import { ProductState } from "#modules/catalogue/states/product.state";

/**
 * Key `catalogue.product`, table `products` (derived). Public ids are `prd_…`; the slug is unique
 * per tenant.
 */
@Model()
@Index(["tenantId", "slug"], { unique: true }) // → idx_products_tenant_id_slug
export class Product extends Model.with(
  HasPublicId("prd"),
  BelongsToTenant,
  Timestamps,
  Versioned,
  Translatable(["title", "description"]),
) {
  /** Display name, one value per locale (`product.title.in(locale)`); the console edits each. */
  @Str({ max: 200 }) title!: Translated;
  /** URL segment, unique per tenant; not translated. */
  @Str({ max: 200 }) slug!: string;
  /**
   * Rich-text document (L2) per locale, shown on the storefront product page; null until the
   * merchant writes one.
   */
  @Nullable() @Json() description!: Translated | null;
  /**
   * Storefront images in display order; the first is the card image. Empty for a product sold
   * without one.
   */
  @Json(StorefrontImage.schema.array()) images!: StorefrontImage[];
  /**
   * The storefront collections the product is listed in. shortcut: denormalised `{ title, slug }`
   * pairs, a `@Link` to a collections module once one exists.
   */
  @Json() collections!: { title: string; slug: string }[];
  /**
   * Merchant overrides of the page's title and meta description; `noindex` keeps a product out of
   * the sitemap. Null = derive from the title.
   */
  @Nullable() @Json() seo!: {
    title: string | null;
    description: string | null;
    noindex: boolean;
  } | null;
  /** Sale state; moves only through a transition (states/product.state.ts). */
  @HasState(ProductState) status!: ProductState;
  /** The variants customers actually buy; a product with none cannot be Active. */
  @HasMany(() => Variant, (variant) => variant.product) variants!: Variant[];
}
