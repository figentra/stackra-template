/**
 * Stackra file contract:
 * Purpose: `idx_variants_tenant_id_barcode`, the per-tenant unique index of
 *          `catalogue.variants.barcode`.
 * Boundary: a frozen snapshot written by `stackra db diff` after the model gained its `@Index`;
 *           literals only. Online: the table already exists, so `concurrently()` is required and
 *           the compiler emits a single-statement, non-transactional step; writes continue while it
 *           builds. A unique index, never an `ADD UNIQUE` constraint (a banned rewrite). Nulls
 *           never collide in it, so existing rows stay valid. No `down()`: gen derives the dev
 *           inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0159 (as amended: online operations)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Built without locking writes. */
export class VariantsBarcodeIndexMigration extends Migration {
  /** One concurrent unique index. */
  up(schema: SchemaBuilder): void {
    schema.table("variants", (t: Blueprint) => {
      t.unique(["tenant_id", "barcode"]).concurrently();
    });
  }
}
