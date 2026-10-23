/**
 * Stackra file contract:
 * Purpose: the per-tenant unique index of `catalogue.variants.barcode`, in its own migration
 *          because a concurrent build cannot run inside a transaction.
 * Boundary: written by `stackra db diff` after the model gained its `@Index` on `barcode`,
 *           reviewed, then committed and never edited. `concurrently()` makes the compiler emit it
 *           outside a transaction, so writes continue while it builds on the live table. Forward
 *           only.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13), ADR 0159 (as amended: concurrent index builds in
 *                     their own migration)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Variants } from "#stackra/tables";

/** `idx_variants_tenant_id_barcode`; nulls never collide in it, so existing rows stay valid. */
export class VariantsBarcodeIndexMigration extends Migration {
  /** Builds the unique index while writes continue; the build cannot share a transaction. */
  up(schema: Blueprint): void {
    schema.table(Variants, (t) => {
      t.unique([Variants.columns.tenantId, Variants.columns.barcode]).concurrently();
    });
  }
}
