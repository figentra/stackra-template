/**
 * Stackra file contract:
 * Purpose: expand step: adds the nullable `catalogue.variants.barcode` for the POS lookup.
 * Boundary: a frozen snapshot written by `stackra db diff` after the model gained `barcode`;
 *           literals only. Additive: one nullable column in one transaction, so no backfill and no
 *           contract step. Its per-tenant unique index is 0003, built online on the live table. No
 *           `down()`: gen derives the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0159 (as amended: expand and contract)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Existing rows stay valid: the column is nullable. */
export class AddVariantBarcodeMigration extends Migration {
  /** Adds the nullable column. */
  up(schema: SchemaBuilder): void {
    schema.table("variants", (t: Blueprint) => {
      t.string("barcode", 14).nullable();
    });
  }
}
