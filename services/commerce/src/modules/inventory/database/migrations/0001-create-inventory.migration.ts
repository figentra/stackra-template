/**
 * Stackra file contract:
 * Purpose: the first table of the inventory module, `inventory.stock_levels`, with every column and
 *          index the model declared at the time.
 * Boundary: a frozen snapshot written by `stackra db diff` from `inventory.stock_level`, reviewed,
 *           then never edited once on main: it imports only @stackra/database, and every name is a
 *           literal. The table name is relative to the module's Postgres schema (`inventory`). The
 *           variant is catalogue's public id in a plain `varchar(30)` column, with no foreign key
 *           into another module. The partner macros write the trait columns. Additive: one
 *           transaction. No `down()`: gen derives the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0159 (as amended), ADR 0239, ADR 0231 (index and key
 *                     names)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** One row per tenant, variant and location. */
export class CreateInventoryMigration extends Migration {
  /** Creates the table with its one-row-per-variant-and-location index. */
  up(schema: SchemaBuilder): void {
    schema.create("stock_levels", (t: Blueprint) => {
      t.hasPublicId("stk");
      t.belongsToTenant();
      t.timestamps();
      t.versioned();
      t.string("variant_id", 30)
        .notNull()
        .comment("Public id of the catalogue variant; catalogue owns the variant row.");
      t.string("location_id", 64).notNull().comment("Public id of the warehouse or shop.");
      t.integer("on_hand")
        .notNull()
        .default(0)
        .comment("Physical units counted at the location, set by `inventory.stock.adjust`.");
      t.integer("reserved")
        .notNull()
        .default(0)
        .comment("Units held for pending orders; raised by reserve, lowered by release.");
      t.unique(["tenant_id", "variant_id", "location_id"]);
    });
  }
}
