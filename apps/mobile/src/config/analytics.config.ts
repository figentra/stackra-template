/**
 * Stackra file contract:
 * Purpose: one fact: product analytics on the device. The driver by name, the consent category that
 *          gates it, what is captured automatically, the properties that never leave the device.
 * Boundary: the key is env (`EXPO_PUBLIC_POSTHOG_KEY`). Nothing is sent before the user grants
 *           `ConsentCategory.Analytics`; events are classes under `src/analytics/` sent with
 *           `analytics.track(...)`. Drivers self-register (`@Driver(AnalyticsDriver, "posthog")`);
 *           dev selects `none` through runway.
 * Runtime: react-native
 * Governing contract: ADR 0071, ADR 0184
 */
import { AnalyticsDriver } from "@stackra/analytics/contracts";
import { Config, DriverOf, Env } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { Bool, List, OneOf, Str } from "@stackra/validation";
import { ConsentCategory } from "#src/enums/consent-category.enum";

/** Product analytics on the phone: driver, gating consent and what it captures. */
@Config("mobile.analytics")
export class AnalyticsConfig {
  /** Which registered analytics driver runs. @defaultValue "posthog" */
  @DriverOf(AnalyticsDriver) driver: DriverName<AnalyticsDriver> = "posthog";
  /** The public project key; empty disables sending. */
  @Env("EXPO_PUBLIC_POSTHOG_KEY") @Str({ allowEmpty: true }) posthogKey = "";
  /** The consent category that gates every event; gen checks it is in consent.config.ts. */
  @OneOf(ConsentCategory) consent = ConsentCategory.Analytics;
  /** Record a screen view per route change. @defaultValue true */
  @Bool() autocaptureScreens = true;
  /** Property names stripped from every event before it leaves the device. */
  @List(Str) denyProperties: string[] = ["email", "phone"];
}
