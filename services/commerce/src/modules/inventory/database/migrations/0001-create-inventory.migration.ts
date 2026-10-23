/**
 * Stackra file contract:
 * Purpose: the first table of the inventory module, `inventory.stock_levels`, with every column and
 *          `@Index` the model declared at the time.
 * Boundary: written by `stackra db diff` from `inventory.stock_level`, reviewed, then committed and
 *           never edited. It changes only the module's own Postgres schema (`inventory`); the table
 *           constants carry the qualified name, and gen creates the schema before the module's
 *           first migration. The variant is catalogue's public id in a plain `varchar(30)` column,
 *           with no foreign key into another module. Forward only: there is no `down()`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27), ADR 0159 (as amended), ADR 0231
 *                     (index and key names)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { StockLevels } from "#stackra/tables";

/** One row per tenant, variant and location. */
export class CreateInventoryMigration extends Migration {
  /** Creates the table with its one-row-per-variant-and-location index. */
  up(schema: Blueprint): void {
    schema.create(StockLevels, (t) => {
      t.publicId("stk");
      t.tenant();
      t.timestamps();
      t.versioned();
      t.string(StockLevels.columns.variantId, 30); // PublicId<"var">
      t.string(StockLevels.columns.locationId, 64);
      t.integer(StockLevels.columns.onHand).default(0);
      t.integer(StockLevels.columns.reserved).default(0);
      // idx_stock_levels_tenant_id_variant_id_location_id
      t.unique([
        StockLevels.columns.tenantId,
        StockLevels.columns.variantId,
        StockLevels.columns.locationId,
      ]);
    });
  }
}
