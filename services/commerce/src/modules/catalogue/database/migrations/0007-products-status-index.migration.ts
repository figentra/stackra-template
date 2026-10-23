/**
 * Stackra file contract:
 * Purpose: `idx_products_tenant_id_status`, the index behind the status filter of ProductResource's
 *          table and its three views.
 * Boundary: a frozen snapshot written by `stackra db diff` after the model gained its `@Index`;
 *           literals only. Gen refuses a filterable resource key without an index
 *           (`filter_not_indexed`), so the table contract and this migration land together. Online:
 *           one concurrent index on a live table, emitted as its own non-transactional step. No
 *           `down()`: gen derives the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0159 (as amended: online operations), ADR 0164 (as amended for v3.1)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** The status filter, per tenant. */
export class ProductsStatusIndexMigration extends Migration {
  /** One concurrent index. */
  up(schema: SchemaBuilder): void {
    schema.table("products", (t: Blueprint) => {
      t.index(["tenant_id", "status"]).concurrently();
    });
  }
}
