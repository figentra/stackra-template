/**
 * Stackra file contract:
 * Purpose: the queue list's data: pending entries, conflicts, and the resolutions a user may pick
 *          per entry.
 * Boundary: a projection over `useMutationQueue()`; strategies are the ones the action declared
 *           (`onConflict`), read from `#stackra/offline`, so the UI cannot offer `client_retry` to
 *           an action that forbids it.
 * Runtime: browser
 * Governing contract: ADR 0059 decision 3 (409 is a conflict record), ADR 0252
 */
import { ConflictResolution } from "@stackra/actions";
import { useMutationQueue, type ConflictRecord, type PendingMutation } from "@stackra/query/react";
import { Offline } from "#stackra/offline";

/** What the sheet lists and what each row can do. */
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
  /**
   * Asks the leader to drain now (after a reconnect the queue does this itself; the button is for
   * impatience).
   */
  readonly syncNow: () => Promise<void>;
}

/** The queue, as the pending-changes sheet needs it. */
export function usePendingChanges(): PendingChangesState {
  const queue = useMutationQueue();
  return {
    items: queue.items,
    conflicts: queue.conflicts,
    isSyncing: queue.isDraining,
    strategiesFor: (conflict) =>
      Offline.for(conflict.action)?.onConflict ?? [ConflictResolution.Manual],
    resolve: (conflict, strategy) => queue.resolve(conflict.id, strategy),
    discard: (conflict) => queue.discard(conflict.id),
    syncNow: () => queue.drain(),
  };
}
