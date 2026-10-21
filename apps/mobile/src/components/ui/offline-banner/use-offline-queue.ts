/**
 * Stackra file contract:
 * Purpose: the hook behind the banner: online state from the platform `network` port, and the
 *          mutation queue's pending and conflict counts from @stackra/query.
 * Boundary: reads only, plus `retry`, which asks the queue to replay now. Conflict resolution UI is
 *           not here (R16: storage owns the conflict record, a screen owns the resolution).
 * Runtime: react-native
 * Governing contract: ADR 0059, ADR 0252, ADR 0250
 */
import { useCapability } from "@stackra/platform/react";
import { useMutationQueue } from "@stackra/query/react";
import { useSignal } from "@stackra/state/react";

/** What the banner renders from. */
export interface OfflineQueueState {
  /** `false` when the network port reports no route; the banner shows. */
  readonly isOnline: boolean;
  /** Mutations held in the outbox waiting for a connection. */
  readonly pending: number;
  /** Mutations the server answered `409` to; they wait for the user (ADR 0059 d3). */
  readonly conflicts: number;
  /** Drains the queue now, without waiting for the reconnect event. */
  readonly retry: () => Promise<void>;
}

/** Combines the network signal and the queue counters; re-renders only when one of them changes. */
export function useOfflineQueue(): OfflineQueueState {
  const network = useCapability("network", { required: true });
  // a @stackra/state signal the Expo driver updates from expo-network
  const isOnline = useSignal(network.isOnline);
  const queue = useMutationQueue();
  return {
    isOnline,
    pending: queue.pending,
    conflicts: queue.conflicts.length,
    retry: () => queue.drain(),
  };
}
