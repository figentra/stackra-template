/**
 * Stackra file contract:
 * Purpose: one fact: feature flags on the console. The provider by driver name, build-time values
 *          for the config provider, refresh and targeting.
 * Boundary: a flag is a release switch, never a commercial right (entitlements are a separate
 *           gate). Owners, expiry and removal issues are on the `@Flag` declarations of the
 *           consumed modules; routes and menu items name them as `Flags.orders.quick_order` from
 *           `#stackra/flags`. The PostHog key is the env class's.
 * Runtime: isomorphic
 * Governing contract: ADR 0213 d3 (flags are a settings kind), ADR 0231 (driver names are checked
 *                     literals)
 */
import { Config, DriverOf } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { FlagProvider } from "@stackra/feature-flags/contracts";
import { FlagTargeting } from "@stackra/feature-flags";
import { Bool, Duration, Map, OneOf } from "@stackra/validation";

/** Feature flags on the console: provider driver, build-time defaults and targeting. */
@Config("console.flags")
export class FeatureFlagsConfig {
  /**
   * `config` reads values from this file and runway (dev, on-prem); `posthog` is SaaS.
   * @defaultValue "config"
   */
  @DriverOf(FlagProvider) provider: DriverName<FlagProvider> = "config";
  /**
   * Build-time values for the `config` provider; an unlisted flag takes its declared default.
   * @defaultValue {}
   */
  @Map(Bool) values: Record<string, boolean> = {};
  /** How often a remote provider is asked again. @defaultValue "60s" */
  @Duration() refreshEvery = "60s";
  /** Evaluate per tenant or per actor. @defaultValue FlagTargeting.Tenant */
  @OneOf(FlagTargeting) targeting = FlagTargeting.Tenant;
  /** Fail gen on a flag past its expiry instead of warning. @defaultValue true */
  @Bool() failOnExpired = true;
}
