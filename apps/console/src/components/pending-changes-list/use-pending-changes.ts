/**
 * Stackra file contract:
 * Purpose: the queue list's data: pending entries, conflicts, and the resolutions a user may pick
 *          per entry.
 * Boundary: a projection over `useMutationQueue()`; strategies are the ones the action declared
 *           (`onConflict`), read from `#stackra/offline`, so the UI cannot offer `client_retry` to
 *           an action that forbids it. The result type is `types/pending-changes-state.type.ts`.
 * Runtime: browser
 * Governing contract: ADR 0059 decision 3 (409 is a conflict record), ADR 0252
 */
import { ConflictResolution } from "@stackra/actions";
import { useMutationQueue } from "@stackra/query/react";
import { Offline } from "#stackra/offline";
import type { PendingChangesState } from "#src/types/pending-changes-state.type";

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
