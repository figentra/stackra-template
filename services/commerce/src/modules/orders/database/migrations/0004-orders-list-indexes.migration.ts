/**
 * Stackra file contract:
 * Purpose: `idx_orders_tenant_id_created_at` and `idx_orders_tenant_id_total_minor`, the indexes
 *          behind the two sortable columns of OrderResource's table.
 * Boundary: a frozen snapshot written by `stackra db diff` after the model gained the two `@Index`
 *           declarations; literals only. Gen refuses a sortable or filterable resource key without
 *           an index (`sort_not_indexed`), so the table contract and this migration land together.
 *           Online: two concurrent indexes on a live table compile to two single-statement,
 *           non-transactional steps. No `down()`: gen derives the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0159 (as amended: online operations), ADR 0164 (as amended for v3.1)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Newest-first paging and the sort by total, per tenant. */
export class OrdersListIndexesMigration extends Migration {
  /** Builds both indexes while writes continue. */
  up(schema: SchemaBuilder): void {
    schema.table("orders", (t: Blueprint) => {
      t.index(["tenant_id", "created_at"]).concurrently();
      t.index(["tenant_id", "total_minor"]).concurrently();
    });
  }
}
