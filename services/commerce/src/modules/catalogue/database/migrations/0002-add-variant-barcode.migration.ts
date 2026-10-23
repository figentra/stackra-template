/**
 * Stackra file contract:
 * Purpose: expand step: adds the nullable `catalogue.variants.barcode` and its per-tenant unique
 *          index for the POS lookup.
 * Boundary: written by `stackra db diff` after the model gained `barcode` and its `@Index`,
 *           reviewed, then committed and never edited. The unique index is built concurrently
 *           because the table is live. No contract step is needed: the column is nullable and
 *           nothing is dropped. Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13), ADR 0159 (as amended: expand and contract,
 *                     concurrent index builds)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Variants } from "#stackra/tables";

/** Existing rows stay valid: the column is nullable, and nulls never collide in the index. */
export class AddVariantBarcodeMigration extends Migration {
  /** Adds the nullable column and its unique index. */
  up(schema: Blueprint): void {
    schema.table(Variants, (t) => {
      t.string(Variants.columns.barcode, 14).nullable();
      // idx_variants_tenant_id_barcode
      t.unique([Variants.columns.tenantId, Variants.columns.barcode]).concurrently();
    });
  }
}
