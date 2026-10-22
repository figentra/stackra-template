/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: explicit exports only.
 * Runtime: browser
 * Governing contract: ADR 0128 (component folders)
 */
export { ConsentBanner } from "./consent-banner";
export { useAnalyticsConsent } from "./use-analytics-consent";
export type { AnalyticsConsentState } from "./use-analytics-consent";
