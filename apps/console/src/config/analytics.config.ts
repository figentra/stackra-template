/**
 * Stackra file contract:
 * Purpose: one fact: product analytics in the console. The driver by name, the consent category
 *          that gates it and what is captured automatically.
 * Boundary: the key is env (`VITE_POSTHOG_KEY`). Nothing is sent before the user grants the
 *           category in settings; events carry the user id and tenant id only, never a name or an
 *           email. Drivers self-register.
 * Runtime: isomorphic
 * Governing contract: ADR 0071 d6 (no personal data without consent), ADR 0231 (checked driver
 *                     names)
 */
import { AnalyticsDriver } from "@stackra/analytics/contracts";
import { Config, DriverOf } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { ConsentCategory } from "@stackra/consent";
import { Bool, List, OneOf, Str } from "@stackra/validation";

/** Product analytics in the console: driver, gating consent and capture switches. */
@Config("console.analytics")
export class AnalyticsConfig {
  /** `posthog` in SaaS, `none` on-prem and in dev, `memory` in tests. @defaultValue "posthog" */
  @DriverOf(AnalyticsDriver) driver: DriverName<AnalyticsDriver> = "posthog";
  /** The consent category that must be granted first. @defaultValue ConsentCategory.Analytics */
  @OneOf(ConsentCategory) consentCategory = ConsentCategory.Analytics;
  /** Record a page view on every route change. @defaultValue true */
  @Bool() autocapturePageviews = true;
  /**
   * Record clicks without an explicit event; off so only declared events are sent.
   * @defaultValue false
   */
  @Bool() autocaptureClicks = false;
  /**
   * Properties stripped from every event before it leaves the browser.
   * @defaultValue ["email", "phone"]
   */
  @List(Str) denyProperties: string[] = ["email", "phone"];
}
