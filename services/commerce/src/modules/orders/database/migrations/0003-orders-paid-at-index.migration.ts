/**
 * Stackra file contract:
 * Purpose: the index the revenue-today query reads on `orders.orders` (tenant, status, paid at), in
 *          its own migration because a concurrent build cannot run inside a transaction.
 * Boundary: written by `stackra db diff` after the model gained its `@Index` on `paidAt`, reviewed,
 *           then committed and never edited. `concurrently()` makes the compiler emit it outside a
 *           transaction, so writes continue while it builds on the live table; the timeouts are
 *           the compiler's defaults (lock 3 s, statement 30 s). Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13), ADR 0159 (as amended: concurrent index builds in
 *                     their own migration)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Orders } from "#stackra/tables";

/** `idx_orders_tenant_id_status_paid_at`, built without locking writes. */
export class OrdersPaidAtIndexMigration extends Migration {
  /** Builds the index while writes continue; the build cannot share a transaction. */
  up(schema: Blueprint): void {
    schema.table(Orders, (t) => {
      t.index([
        Orders.columns.tenantId,
        Orders.columns.status,
        Orders.columns.paidAt,
      ]).concurrently();
    });
  }
}
