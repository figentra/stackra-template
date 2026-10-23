/**
 * Stackra file contract:
 * Purpose: expand step: adds the nullable `catalogue.variants.barcode` for the POS lookup.
 * Boundary: written by `stackra db diff` after the model gained `barcode`, reviewed, then committed
 *           and never edited. Its per-tenant unique index is 0003, built concurrently in its own
 *           migration, because a concurrent build cannot share this one's transaction. No contract
 *           step is needed: the column is nullable and nothing is dropped. Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13), ADR 0159 (as amended: expand and contract,
 *                     concurrent index builds in their own migration)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Variants } from "#stackra/tables";

/** Existing rows stay valid: the column is nullable. */
export class AddVariantBarcodeMigration extends Migration {
  /** Adds the nullable column. */
  up(schema: Blueprint): void {
    schema.table(Variants, (t) => {
      t.string(Variants.columns.barcode, 14).nullable();
    });
  }
}
