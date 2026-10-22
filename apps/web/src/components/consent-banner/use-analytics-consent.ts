/**
 * Stackra file contract:
 * Purpose: ties the consent store to the analytics driver: granting the analytics category starts
 *          page-view tracking, declining (or withdrawing) stops it and drops the queued events.
 * Boundary: one category, one driver. The consent record itself (cookie, timestamp, version) is
 *           @stackra/consent's.
 * Runtime: browser
 * Governing contract: ADR 0071 decision 6 (no personal data to analytics without consent), ADR 0128
 */
import { useAnalytics } from "@stackra/analytics/react";
import { ConsentCategory, ConsentStatus } from "@stackra/consent";
import { useConsent } from "@stackra/consent/react";

/** What the banner and the footer's settings link need. */
export interface AnalyticsConsentState {
  /** True once the visitor chose either way; the banner hides. */
  readonly isDecided: boolean;
  /** True when analytics may run. */
  readonly isAllowed: boolean;
  /** Record the grant and start the driver. */
  readonly allow: () => void;
  /** Record the refusal, stop the driver and clear its queue. */
  readonly decline: () => void;
  /** Forget the decision so the banner shows again. */
  readonly reset: () => void;
}

/**
 * Reads the analytics category and drives the one analytics instance; safe to call from several
 * components.
 */
export function useAnalyticsConsent(): AnalyticsConsentState {
  const consent = useConsent(ConsentCategory.Analytics);
  const analytics = useAnalytics();
  return {
    isDecided: consent.status !== ConsentStatus.Undecided,
    isAllowed: consent.status === ConsentStatus.Granted,
    allow: () => {
      consent.grant();
      analytics.optIn();
    },
    decline: () => {
      consent.deny();
      analytics.optOut({ clearQueue: true });
    },
    reset: () => consent.reset(),
  };
}
