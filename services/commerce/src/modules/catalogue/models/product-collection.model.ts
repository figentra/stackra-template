/**
 * Stackra file contract:
 * Purpose: the ProductCollection model: a named storefront collection a merchant lists products in
 *          ("Summer", "Shirts"), which the store filters by and a product page links to.
 * Boundary: data and indexes. Key `catalogue.product_collection`, table
 *           `catalogue.product_collections`, public ids `pcl_…`. Named `ProductCollection`, not
 *           `Collection`, because `Collection` is the relation class of @stackra/model. Products
 *           reach it through `Product.collections` (a many-to-many with the pivot table
 *           `catalogue.product_collection_items`), so a renamed collection shows its new title on
 *           every product at once. Rows are built by CrudService or a factory, never with `new`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20 and 27, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0133 (traits)
 */
import { Index, Model, type Translated } from "@stackra/model";
import { BelongsToTenant, HasPublicId, Timestamps, Translatable } from "@stackra/model/traits";
import { Str } from "@stackra/validation";

/** The slug is unique per tenant (`idx_product_collections_tenant_id_slug`): the filter key. */
@Index(["tenantId", "slug"], { unique: true })
export class ProductCollection extends Model.with(
  HasPublicId("pcl"),
  BelongsToTenant,
  Timestamps,
  Translatable(["title"]),
) {
  /** Display name, one value per locale; the storefront shows the visitor's. */
  @Str({ max: 120 })
  title!: Translated;

  /** URL segment the store filters on (`?collection=summer`); not translated. */
  @Str({ max: 64 })
  slug!: string;
}
