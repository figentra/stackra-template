/**
 * Stackra file contract:
 * Purpose: one fact: product analytics on the public site. The driver by name, which consent
 *          category gates it, what is captured automatically, the ingest origin.
 * Boundary: the key is env (`VITE_POSTHOG_KEY`). No identity is ever attached on the public site;
 *           the driver runs cookieless until consent. Drivers self-register.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (checked driver names)
 */
import { AnalyticsDriver } from "@stackra/analytics/contracts";
import { Config, DriverOf } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { ConsentCategory } from "@stackra/consent";
import { Bool, List, OneOf, Str, Url } from "@stackra/validation";

/**
 * Product analytics on the public site: driver, consent category that gates it and what it
 * captures.
 */
@Config("web.analytics")
export class AnalyticsConfig {
  /** `posthog` in SaaS, `none` in dev (runway), `memory` in tests. @defaultValue "posthog" */
  @DriverOf(AnalyticsDriver) driver: DriverName<AnalyticsDriver> = "posthog";
  /**
   * Reverse-proxied ingest through the site origin; empty means the provider host.
   * @defaultValue ""
   */
  @Url({ allowEmpty: true }) ingestOrigin = "";
  /** Record a page view per navigation. @defaultValue true */
  @Bool() autocapturePageviews = true;
  /**
   * Record clicks without an explicit event; off so only declared events are sent.
   * @defaultValue false
   */
  @Bool() autocaptureClicks = false;
  /** Send field web vitals with the page view. @defaultValue true */
  @Bool() webVitals = true;
  /** Record session replays; off on the public site. @defaultValue false */
  @Bool() sessionReplay = false;
  /** Run without cookies until consent is granted. @defaultValue true */
  @Bool() cookieless = true;
  /** The consent category that must be granted first. @defaultValue ConsentCategory.Analytics */
  @OneOf(ConsentCategory) consentCategory = ConsentCategory.Analytics;
  /**
   * Properties stripped from every event before it leaves the browser.
   * @defaultValue ["email", "phone"]
   */
  @List(Str) denyProperties: string[] = ["email", "phone"];
}
