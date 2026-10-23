/**
 * Stackra file contract:
 * Purpose: `idx_orders_tenant_id_status_paid_at`, the index the KPI query's paid-revenue aggregates
 *          and the paid-today view read.
 * Boundary: a frozen snapshot written by `stackra db diff` after the model gained its `@Index`;
 *           literals only. Online: the table already exists, so `concurrently()` is required and
 *           the compiler emits it as its own non-transactional, single-statement step; writes
 *           continue while it builds. No `down()`: gen derives the dev inverse (drop the index
 *           concurrently).
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0159 (as amended: online operations)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Built without locking writes. */
export class OrdersPaidAtIndexMigration extends Migration {
  /** One concurrent index. */
  up(schema: SchemaBuilder): void {
    schema.table("orders", (t: Blueprint) => {
      t.index(["tenant_id", "status", "paid_at"]).concurrently();
    });
  }
}
