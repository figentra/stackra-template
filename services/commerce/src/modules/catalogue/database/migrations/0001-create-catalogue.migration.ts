/**
 * Stackra file contract:
 * Purpose: the first tables of the catalogue module, `catalogue.products` and `catalogue.variants`,
 *          with every column and index the models declared at the time.
 * Boundary: a frozen snapshot, written by `stackra db diff` from `catalogue.product` and
 *           `catalogue.variant`, reviewed, then never edited once on main: it imports only
 *           @stackra/database, and table names, column names and enum values are literals, so a
 *           later model change can never rewrite it. Table names are relative to the module's
 *           Postgres schema (`catalogue`). The partner macros (`hasPublicId`, `belongsToTenant`,
 *           `timestamps`, `versioned`, `translatable`) write the columns of the trait they are
 *           named after, and gen fails if their output differs from the models. Additive: one
 *           transaction, indexes on the new tables included. No `down()`: gen derives the dev
 *           inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0159 (as amended), ADR 0239, ADR 0231 (index and key
 *                     names)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** `barcode` and the storefront fields are not here: they arrived later as expand steps. */
export class CreateCatalogueMigration extends Migration {
  /** Creates both tables with the slug and SKU unique indexes. */
  up(schema: SchemaBuilder): void {
    schema.create("products", (t: Blueprint) => {
      t.hasPublicId("prd");
      t.belongsToTenant();
      t.timestamps();
      t.versioned();
      t.translatable(["title"]);
      t.string("slug", 200);
      t.enum("status", ["draft", "active", "archived"]).default("draft");
      t.unique(["tenant_id", "slug"]);
    });
    schema.create("variants", (t: Blueprint) => {
      t.hasPublicId("var");
      t.belongsToTenant();
      t.timestamps();
      t.belongsTo("products", { column: "product_id" }).cascadeOnDelete();
      t.string("sku", 64);
      t.boolean("track_inventory").default(true);
      t.unique(["tenant_id", "sku"]);
    });
  }
}
