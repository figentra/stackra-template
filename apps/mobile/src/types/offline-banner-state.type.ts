/**
 * Stackra file contract:
 * Purpose: what the offline banner renders from: the network state, the queue's pending and
 *          conflict counts, and the manual replay.
 * Boundary: a type only; `useOfflineBanner` returns it and `OfflineBanner` reads it.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: one
 *                     declaration per file), ADR 0059, ADR 0252
 */

/** The result of `useOfflineBanner`. */
export interface OfflineBannerState {
  /** `false` when the network port reports no route; the banner shows. */
  readonly isOnline: boolean;
  /** Mutations held in the outbox waiting for a connection. */
  readonly pending: number;
  /** Mutations the server answered `409` to; they wait for the user (ADR 0059 decision 3). */
  readonly conflicts: number;
  /** Drains the queue now, without waiting for the reconnect event. */
  readonly retry: () => Promise<void>;
}
