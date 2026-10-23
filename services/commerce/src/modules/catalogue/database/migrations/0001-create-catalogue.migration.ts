/**
 * Stackra file contract:
 * Purpose: the first tables of the catalogue module, `catalogue.products` and
 *          `catalogue.variants`, with every column and `@Index` the models declared at the time.
 * Boundary: written by `stackra db diff` from `catalogue.product` and `catalogue.variant`,
 *           reviewed, then committed and never edited. It changes only the module's own Postgres
 *           schema (`catalogue`); the table constants carry the qualified names, and gen creates
 *           the schema before the module's first migration. Trait macros write the trait columns,
 *           so the models and their migration cannot drift. Forward only: there is no `down()`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27), ADR 0159 (as amended), ADR 0231
 *                     (index and key names)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Products, Variants } from "#stackra/tables";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";

/** `barcode` and the storefront fields are not here: they arrived later as expand steps. */
export class CreateCatalogueMigration extends Migration {
  /** Creates both tables with the slug and SKU unique indexes. */
  up(schema: Blueprint): void {
    schema.create(Products, (t) => {
      t.publicId("prd");
      t.tenant();
      t.timestamps();
      t.versioned();
      t.translatable([Products.columns.title]); // jsonb locale map
      t.string(Products.columns.slug, 200);
      t.enum(Products.columns.status, ProductStatus); // text with ck_products_status
      t.unique([Products.columns.tenantId, Products.columns.slug]); // idx_products_tenant_id_slug
    });
    schema.create(Variants, (t) => {
      t.publicId("var");
      t.tenant();
      t.timestamps();
      t.belongsTo(Products).cascadeOnDelete(); // fk_variants_product_id and its index
      t.string(Variants.columns.sku, 64);
      t.boolean(Variants.columns.trackInventory).default(true);
      t.unique([Variants.columns.tenantId, Variants.columns.sku]); // idx_variants_tenant_id_sku
    });
  }
}
