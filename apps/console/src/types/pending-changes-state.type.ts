/**
 * Stackra file contract:
 * Purpose: `PendingChangesState`: what `usePendingChanges` returns to the queue list.
 * Boundary: a type only, in the app's `types/` group; entries and conflicts are the query package's
 *           records, resolutions the actions package's enum.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file), ADR 0252, ADR 0059 decision 3
 */
import type { ConflictResolution } from "@stackra/actions";
import type { ConflictRecord, PendingMutation } from "@stackra/query/react";

/** What the queue list shows and what each row can do. */
export interface PendingChangesState {
  /** Entries waiting for the network, per-aggregate FIFO order (`useMutationQueue().items`). */
  readonly items: readonly PendingMutation[];
  /**
   * Entries the server refused with 409, 403 or `stale_offline_mutation`; each holds the local
   * intent and server state.
   */
  readonly conflicts: readonly ConflictRecord[];
  /** True while a drain is running (this tab is the leader). */
  readonly isSyncing: boolean;
  /** Which resolutions the action declared for a conflict (`onConflict`). */
  readonly strategiesFor: (conflict: ConflictRecord) => readonly ConflictResolution[];
  /** Applies a declared resolution; server-wins drops the local intent, client-retry replays. */
  readonly resolve: (conflict: ConflictRecord, strategy: ConflictResolution) => Promise<void>;
  /** Drops the local intent; always offered, whatever the action declared. */
  readonly discard: (conflict: ConflictRecord) => Promise<void>;
  /** Asks the leader to drain now; after a reconnect the queue drains on its own. */
  readonly syncNow: () => Promise<void>;
}
