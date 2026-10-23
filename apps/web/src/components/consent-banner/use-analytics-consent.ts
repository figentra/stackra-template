/**
 * Stackra file contract:
 * Purpose: the banner's view of the analytics consent category: whether the browser has read the
 *          stored decision, whether the visitor decided, whether analytics may run, and the three
 *          ways to change the decision.
 * Boundary: consent only. The analytics package watches the same category: on a grant it sends its
 *           queued events in order, on a refusal it drops them unsent, so nothing here talks to the
 *           driver. The consent record itself (cookie, timestamp, policy version) is
 *           @stackra/consent's, and Global Privacy Control reads as a refusal there. A stored
 *           decision for an older policy version reads as undecided.
 * Runtime: browser
 * Governing contract: ADR 0298 (decisions 2, 3, 5 and 6)
 */
import { ConsentCategory, ConsentStatus } from "@stackra/consent";
import { useConsent } from "@stackra/consent/react";
import type { AnalyticsConsentState } from "#src/types/analytics-consent-state.type";

/** Reads and writes the analytics category; safe to call from several components. */
export function useAnalyticsConsent(): AnalyticsConsentState {
  const consent = useConsent(ConsentCategory.Analytics);
  return {
    isLoaded: consent.isLoaded,
    isDecided: consent.status !== ConsentStatus.Undecided,
    isAllowed: consent.status === ConsentStatus.Granted,
    allow: () => consent.grant(),
    decline: () => consent.deny(),
    reset: () => consent.reset(),
  };
}
