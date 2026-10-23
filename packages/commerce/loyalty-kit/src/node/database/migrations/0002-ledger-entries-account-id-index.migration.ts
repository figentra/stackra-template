/**
 * Stackra file contract:
 * Purpose: the index of the entries' account column, in its own migration because a concurrent
 *          build cannot run inside a transaction.
 * Boundary: written by `stackra db diff` after gen began indexing every many-to-one column,
 *           reviewed, then committed and never edited. `concurrently()` makes the compiler emit it
 *           outside a transaction, so writes continue while it builds. Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 27), ADR 0159 (as amended: concurrent index
 *                     builds in their own migration)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { LedgerEntries } from "#stackra/tables";

/** `idx_ledger_entries_account_id`, built without locking writes. */
export class LedgerEntriesAccountIdIndexMigration extends Migration {
  /** Builds the index while writes continue; the build cannot share a transaction. */
  up(schema: Blueprint): void {
    schema.table(LedgerEntries, (t) => {
      t.index([LedgerEntries.columns.account]).concurrently();
    });
  }
}
