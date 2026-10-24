/**
 * Stackra file contract:
 * Purpose: the Product model: what is sold, in which variants and in which state, with the
 *          storefront fields the merchant edits (description, images, seo) and the collections it
 *          is listed in.
 * Boundary: data, relations, indexes and the search facet. Key `catalogue.product`, table
 *           `catalogue.products` (the module's Postgres schema), public ids `prd_…`. No price (the
 *           pricing service) and no stock (inventory). `status` moves only through
 *           ProductStateMachine. Collections are a same-module many-to-many (`ProductCollection`,
 *           pivot `catalogue.product_collection_items`), never copied onto the row. `@Searchable`
 *           declares the hybrid index the storefront and the POS query: `stackra db diff` writes
 *           its columns and the Postgres search driver keeps it in step with the unit of work.
 *           Rows are built by factories or CrudService, never with `new`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 6, 11, 20 and 27), ADR 0133 (traits), ADR 0221
 *                     (Postgres hybrid search)
 */
import {
  BelongsToTenant,
  Collection,
  HasPublicId,
  Index,
  ManyToMany,
  Model,
  OneToMany,
  Searchable,
  Timestamps,
  Translatable,
  type Translated,
  Versioned,
} from "@stackra/model";
import { Str } from "@stackra/validation";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { ProductCollection } from "#modules/catalogue/models/product-collection.model";
import { Variant } from "#modules/catalogue/models/variant.model";
import type { StorefrontImage } from "#modules/catalogue/schemas/storefront-image.schema";
import type { StorefrontSeo } from "#modules/catalogue/schemas/storefront-seo.schema";

/**
 * A product as persisted. Traits add `id`, the tenant, timestamps, the optimistic version and the
 * per-locale `title` and `description` (`product.title.in(locale)`). Field paths in `@Searchable`
 * are keys of the model and of its populated relations, checked by gen.
 */
@Index(["tenantId", "slug"], { unique: true })
@Index(["tenantId", "status"])
@Searchable({
  text: ["title", "description", "variants.sku", "variants.barcode"],
  filters: ["status", "collections.slug"],
})
export class Product extends Model.with(
  HasPublicId("prd"),
  BelongsToTenant,
  Timestamps,
  Versioned,
  Translatable(["title", "description"]),
) {
  /** Display name, one value per locale; the console edits each. */
  @Str({ max: 200 })
  title!: Translated;

  /** URL segment, unique per tenant (`idx_products_tenant_id_slug`); not translated. */
  @Str({ max: 200 })
  slug!: string;

  /**
   * Sale state; written only by ProductStateMachine. The initializer is the initial state.
   */
  status: ProductStatus = ProductStatus.Draft;

  /** Rich-text document (L2) per locale for the storefront page; null until one is written. */
  description: Translated | null = null;

  /** Storefront images in display order; the first is the card image. */
  images: StorefrontImage[] = [];

  /** The storefront collections the product is listed in; the store filters on their slug. */
  @ManyToMany(() => ProductCollection, { pivotTable: "product_collection_items" })
  collections = new Collection<ProductCollection>(this);

  /** Merchant overrides of the page title and meta description; null derives both from it. */
  seo: StorefrontSeo | null = null;

  /** The variants customers buy; a product with none cannot be ordered. */
  @OneToMany(() => Variant, (variant) => variant.product)
  variants = new Collection<Variant>(this);
}
