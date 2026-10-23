/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/analytics' configuration: the driver by name, the
 *          consent category that gates it, what is captured automatically and the ingest origin.
 * Boundary: an override declares `override` members only and inherits the base's key
 *           (`analytics`), which runway's `config.analytics` layers set per environment. The key is
 *           env (`VITE_POSTHOG_KEY`). No identity is ever attached on the public site, and nothing
 *           is sent before the visitor allows the category: events fired earlier wait in the
 *           package's bounded, ordered queue, are sent in order on acceptance and dropped on
 *           refusal. Fields typed by an enum or a driver name restate their type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0298 (decisions 1 and 5), ADR 0231 (checked
 *                     driver names)
 */
import { AnalyticsConfig } from "@stackra/analytics";
import type { AnalyticsDriver } from "@stackra/analytics/contracts";
import { ConsentCategory } from "@stackra/consent";
import type { DriverName } from "@stackra/container";

/** Product analytics on the public site: driver, gating consent and capture switches. */
export class WebAnalyticsConfig extends AnalyticsConfig {
  /** `posthog` in SaaS, `none` in dev (runway), `memory` in tests. */
  override driver: DriverName<AnalyticsDriver> = "posthog";

  /** Reverse-proxied ingest through the site origin; empty means the provider host. */
  override ingestOrigin = "";

  /** Record a page view per navigation. */
  override autocapturePageviews = true;

  /** Record clicks without an explicit event; off so only declared events are sent. */
  override autocaptureClicks = false;

  /** Send field web vitals with the page view. */
  override webVitals = true;

  /** Record session replays; off on the public site. */
  override sessionReplay = false;

  /** Run without cookies until consent is granted. */
  override cookieless = true;

  /** The consent category that must be granted first. */
  override consentCategory: ConsentCategory = ConsentCategory.Analytics;

  /** Properties stripped from every event before it leaves the browser. */
  override denyProperties = ["email", "phone"];
}
