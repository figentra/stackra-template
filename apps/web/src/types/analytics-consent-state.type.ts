/**
 * Stackra file contract:
 * Purpose: what `useAnalyticsConsent` returns: whether the browser has read the stored decision,
 *          whether the visitor decided, whether analytics may run, and the three ways to change the
 *          decision.
 * Boundary: a type shared by the hook that builds it and the consent banner that renders it; the
 *           consent record itself is @stackra/consent's.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: a hook's result in
 *                     types/), ADR 0298 (decisions 2, 3, 5 and 6)
 */

/** What the banner and the footer's settings link need. */
export interface AnalyticsConsentState {
  /** False on the server and the first client paint, until the browser read the stored decision. */
  readonly isLoaded: boolean;
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
