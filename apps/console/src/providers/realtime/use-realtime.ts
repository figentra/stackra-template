/**
 * Stackra file contract:
 * Purpose: the one hook that reads the realtime connection's status for the shell's connection
 *          indicator.
 * Boundary: read-only; subscribing to an event is `useSubscription` from `@stackra/realtime/react`.
 * Runtime: browser
 * Governing contract: ADR 0225
 */
import { RealtimeStatus } from "@stackra/realtime";
import { useRealtimeConnection } from "@stackra/realtime/react";

/** What the hook returns. */
export interface RealtimeState {
  /** The connection status; `Disconnected` when signed out or the socket is down. */
  readonly status: RealtimeStatus;
}

/** Re-renders only when the status changes. */
export function useRealtime(): RealtimeState {
  const connection = useRealtimeConnection();
  return { status: connection?.status ?? RealtimeStatus.Disconnected };
}
