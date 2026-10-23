/**
 * Stackra file contract:
 * Purpose: expand step: adds `orders.orders.paid_at`. The contract step (drop the capture timestamp
 *          from the payments JSON) ships later; a backfill is a queue job, never a migration.
 * Boundary: written by `stackra db diff` after the model gained `paidAt`, reviewed, then committed
 *           and never edited. The `@Index` the revenue-today query reads is 0003, built
 *           concurrently in its own migration, because a concurrent build cannot share this one's
 *           transaction. Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13), ADR 0159 (as amended: expand and contract,
 *                     concurrent index builds in their own migration, backfills as jobs)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Orders } from "#stackra/tables";

/** Existing rows stay valid: the column is nullable. */
export class AddOrderPaidAtMigration extends Migration {
  /** Adds the nullable column. */
  up(schema: Blueprint): void {
    schema.table(Orders, (t) => {
      t.timestamp(Orders.columns.paidAt).nullable();
    });
  }
}
