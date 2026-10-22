/**
 * Stackra file contract:
 * Purpose: one boolean for "can we reach the API", from the platform's network probe, not
 *          `navigator.onLine` alone (which is true on a captive portal). Shared by the offline
 *          banner and the pending-changes sheet.
 * Boundary: reads the network capability of `@stackra/platform`; no side effects.
 * Runtime: browser
 * Governing contract: ADR 0250 (capability ports), ADR 0128 (a hook shared by two folders lives in
 *                     hooks/)
 */
import { usePlatform } from "@stackra/platform/react";
import { useSignal } from "@stackra/state/react";

/**
 * True when the last probe of the API origin succeeded; flips within the platform's probe interval
 * (default 15 s).
 */
export function useOnlineStatus(): boolean {
  const platform = usePlatform();
  return useSignal(platform.network.isOnline);
}
