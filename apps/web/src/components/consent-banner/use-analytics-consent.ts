/**
 * Stackra file contract:
 * Purpose: the banner's view of the analytics consent category: whether the visitor decided,
 *          whether analytics may run, and the three ways to change the decision.
 * Boundary: consent only. The analytics package watches the same category and starts, stops and
 *           flushes its own queue, so nothing here talks to the driver. The consent record itself
 *           (cookie, timestamp, policy version) is @stackra/consent's.
 * Runtime: browser
 * Governing contract: the `@stackra/consent` and `@stackra/analytics` package contracts
 */
import { ConsentCategory, ConsentStatus } from "@stackra/consent";
import { useConsent } from "@stackra/consent/react";

/** What the banner and the footer's settings link need. */
export interface AnalyticsConsentState {
  /** True once the visitor chose either way; the banner hides. */
  readonly isDecided: boolean;
  /** True when analytics may run. */
  readonly isAllowed: boolean;
  /** Record the grant; analytics starts on its own. */
  readonly allow: () => void;
  /** Record the refusal; analytics stops and drops what it queued on its own. */
  readonly decline: () => void;
  /** Forget the decision so the banner shows again. */
  readonly reset: () => void;
}

/** Reads and writes the analytics category; safe to call from several components. */
export function useAnalyticsConsent(): AnalyticsConsentState {
  const consent = useConsent(ConsentCategory.Analytics);
  return {
    isDecided: consent.status !== ConsentStatus.Undecided,
    isAllowed: consent.status === ConsentStatus.Granted,
    allow: () => consent.grant(),
    decline: () => consent.deny(),
    reset: () => consent.reset(),
  };
}
