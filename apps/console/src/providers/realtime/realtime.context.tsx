/**
 * Stackra file contract:
 * Purpose: mounts the realtime package's provider with the connection `RealtimeProvider.hydrate`
 *          opened, so `useSubscription` and the panel's `refreshOn` share one socket.
 * Boundary: the component only mounts the value; reconnecting with backoff and re-joining after a
 *           tenant switch are the package's.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast), ADR 0142
 */
import type { ReactNode } from "react";
import type { RealtimeConnection } from "@stackra/realtime";
import { RealtimeConnectionProvider } from "@stackra/realtime/react";

/** What the generated provider stack passes: the hydrated connection and the tree. */
export interface RealtimeContextProviderProps {
  /** From `RealtimeProvider.hydrate`; `null` signed out. */
  readonly value: RealtimeConnection | null;
  /** The app subtree that may subscribe to events. */
  readonly children: ReactNode;
}

/** Signed out, the children render without a connection and subscriptions stay idle. */
export function RealtimeContextProvider({ value, children }: RealtimeContextProviderProps) {
  if (!value) return <>{children}</>;
  return <RealtimeConnectionProvider connection={value}>{children}</RealtimeConnectionProvider>;
}
