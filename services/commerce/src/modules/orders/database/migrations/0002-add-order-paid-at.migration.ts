/**
 * Stackra file contract:
 * Purpose: expand step: adds `orders.orders.paid_at`. A backfill is a queue job, never a migration.
 * Boundary: a frozen snapshot written by `stackra db diff` after the model gained `paidAt`; it
 *           imports only @stackra/database and names the column with a literal. Additive: one
 *           nullable column in one transaction, so existing rows stay valid. Its index is 0003,
 *           because an index on a table that already exists is built online in its own step. No
 *           `down()`: gen derives the dev inverse (drop the column).
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0159 (as amended: expand and contract, backfills as jobs)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Existing rows stay valid: the column is nullable. */
export class AddOrderPaidAtMigration extends Migration {
  /** Adds the nullable column. */
  up(schema: SchemaBuilder): void {
    schema.table("orders", (t: Blueprint) => {
      t.timestamp("paid_at").nullable();
    });
  }
}
