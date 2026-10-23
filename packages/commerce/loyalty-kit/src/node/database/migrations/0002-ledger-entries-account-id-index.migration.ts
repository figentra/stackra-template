/**
 * Stackra file contract:
 * Purpose: `idx_ledger_entries_account_id`, built online on the live table.
 * Boundary: written by `stackra db diff` after gen began indexing every many-to-one column,
 *           reviewed, frozen once on main. A snapshot: it imports only @stackra/database and names
 *           the table and column with literals. An index on a table an earlier migration created
 *           must be `concurrently()`, so the compiler emits it as its own non-transactional step
 *           and writes continue while it builds. No `down()`: gen derives the dev inverse (drop
 *           the index concurrently).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 27), ADR 0159 (as amended by programming model
 *                     v3.1, AGENTS.md: online operations in their own step)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Writes continue while it builds. */
export class LedgerEntriesAccountIdIndexMigration extends Migration {
  /** One concurrent index. */
  up(schema: SchemaBuilder): void {
    schema.table("ledger_entries", (t: Blueprint) => {
      t.index(["account_id"]).concurrently();
    });
  }
}
