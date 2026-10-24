/**
 * Stackra file contract:
 * Purpose: the storefront collections and the pivot that lists products in them.
 * Boundary: a frozen snapshot written by `stackra db diff` after ProductCollection and
 *           `Product.collections` were added; literals only. Additive: two new tables, created
 *           empty, so their indexes build inside the transaction. The pivot's two foreign keys
 *           cascade, so deleting a product or a collection removes its listings, and its primary
 *           key is the pair, so a product is listed in a collection once. No `down()`: gen derives
 *           the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0159 (as amended), ADR 0239, ADR 0231 (index and key names)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Collections first, then the pivot that references them and the products. */
export class CreateProductCollectionsMigration extends Migration {
  /** Creates both tables with the slug unique index and the pivot's foreign keys. */
  up(schema: SchemaBuilder): void {
    schema.create("product_collections", (t: Blueprint) => {
      t.hasPublicId("pcl");
      t.belongsToTenant();
      t.timestamps();
      t.translatable(["title"])
        .notNull()
        .comment("Display name, one value per locale; the storefront shows the visitor's.");
      t.string("slug", 64)
        .notNull()
        .comment("URL segment the store filters on (`?collection=summer`); not translated.");
      t.unique(["tenant_id", "slug"]);
    });
    schema.create("product_collection_items", (t: Blueprint) => {
      t.belongsToTenant();
      t.belongsTo("products", { column: "product_id" })
        .notNull()
        .cascadeOnDelete()
        .comment("The product listed in the collection; deleted with the product.");
      t.belongsTo("product_collections", { column: "product_collection_id" })
        .notNull()
        .cascadeOnDelete()
        .comment("The collection the product is listed in; deleted with the collection.");
      t.primary(["product_id", "product_collection_id"]);
    });
  }
}
