/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/analytics' configuration: product analytics on the
 *          device. The driver by name, the consent category that gates it, what is captured
 *          automatically and the properties that never leave the device.
 * Boundary: an override declares `override` members only and inherits the base's key (`analytics`);
 *           its presence mounts the analytics context, so the app writes no provider. The project
 *           key is a public env value: `EnvConfig.analyticsPosthogKey` (`EXPO_PUBLIC_POSTHOG_KEY`)
 *           feeds `posthogKey`, so this class reads no environment. Nothing is sent before the user
 *           grants `ConsentCategory.Analytics`; events fired earlier wait in the package's bounded
 *           queue and are dropped on refusal. Events are classes under `src/analytics/`, sent with
 *           `analytics.track(X.create(...))`. Dev selects the `none` driver through runway. A field
 *           typed by an enum or a driver name restates its type.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md: Base
 *                     alias), ADR 0295 (decision 10), ADR 0298, ADR 0071, ADR 0184
 */
import { AnalyticsConfig as BaseAnalyticsConfig } from "@stackra/analytics";
import type { AnalyticsDriver } from "@stackra/analytics/contracts";
import type { DriverName } from "@stackra/container";
import { ConsentCategory } from "#src/enums/consent-category.enum";

/** PostHog on the phone, gated by the analytics consent, with contact fields stripped. */
export class AnalyticsConfig extends BaseAnalyticsConfig {
  /** The registered analytics driver that runs; runway selects `none` in dev. */
  override driver: DriverName<AnalyticsDriver> = "posthog";

  /** The consent category that gates every event; gen checks it is in consent.config.ts. */
  override consent: ConsentCategory = ConsentCategory.Analytics;

  /** Record a screen view per route change. */
  override autocaptureScreens = true;

  /** Property names stripped from every event before it leaves the device. */
  override denyProperties = ["email", "phone"];
}
