/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/analytics' configuration: the driver by name, the
 *          consent category that gates it and what is captured automatically.
 * Boundary: an override keeps the base's name and imports the base as `BaseAnalyticsConfig`; it
 *           sets `override` field defaults only, has no schema or env of its own and inherits the
 *           base's key (`analytics`), which runway's `config.analytics` layers set per environment.
 *           The PostHog key comes from `EnvConfig.analyticsPosthogKey`. Nothing is sent before the
 *           user grants the category in settings; events carry the user id and tenant id only,
 *           never a name or an email. A second override of the same base fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0298 (consent), ADR 0231 (checked driver names)
 */
import { AnalyticsConfig as BaseAnalyticsConfig } from "@stackra/analytics";
import type { AnalyticsDriver } from "@stackra/analytics/contracts";
import { ConsentCategory } from "@stackra/consent";
import type { DriverName } from "@stackra/container";

/** Product analytics in the console: driver, gating consent and capture switches. */
export class AnalyticsConfig extends BaseAnalyticsConfig {
  /** `posthog` in SaaS, `none` on-prem and in dev, `memory` in tests. */
  override driver: DriverName<AnalyticsDriver> = "posthog";

  /** The consent category that must be granted first. */
  override consentCategory: ConsentCategory = ConsentCategory.Analytics;

  /** Record a page view on every route change. */
  override autocapturePageviews = true;

  /** Record clicks without an explicit event; off so only declared events are sent. */
  override autocaptureClicks = false;

  /** Properties stripped from every event before it leaves the browser. */
  override denyProperties = ["email", "phone"];
}
