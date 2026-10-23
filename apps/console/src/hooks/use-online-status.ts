/**
 * Stackra file contract:
 * Purpose: one boolean for "can we reach the API", from the platform's network probe, not
 *          `navigator.onLine` alone (which is true on a captive portal). Read by the shell's
 *          offline banner and by the offline page, so it sits in the app's `hooks/` group.
 * Boundary: reads the network capability of `@stackra/platform`; no side effects.
 * Runtime: browser
 * Governing contract: ADR 0250 (capability ports), ADR 0294 decision 14 (`hooks/` holds a hook with
 *                     two or more importers)
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
