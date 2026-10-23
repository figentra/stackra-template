/**
 * Stackra file contract:
 * Purpose: expand step: adds `orders.orders.paid_at` and the `@Index` the revenue-today query
 *          reads. The contract step (drop the capture timestamp from the payments JSON) ships
 *          later; a backfill is a queue job, never a migration.
 * Boundary: written by `stackra db diff` after the model gained `paidAt` and its index, reviewed,
 *           then committed and never edited. The index is built concurrently because the table is
 *           live; the timeouts are the compiler's defaults (lock 3 s, statement 30 s). Forward
 *           only.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13), ADR 0159 (as amended: expand and contract,
 *                     concurrent index builds, backfills as jobs)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Orders } from "#stackra/tables";

/** Existing rows stay valid: the column is nullable. */
export class AddOrderPaidAtMigration extends Migration {
  /** Adds the nullable column and its index. */
  up(schema: Blueprint): void {
    schema.table(Orders, (t) => {
      t.timestamp(Orders.columns.paidAt).nullable();
      // idx_orders_tenant_id_status_paid_at
      t.index([
        Orders.columns.tenantId,
        Orders.columns.status,
        Orders.columns.paidAt,
      ]).concurrently();
    });
  }
}
