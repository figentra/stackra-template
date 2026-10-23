/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/feature-flags' configuration: the provider by driver
 *          name, build-time values for the config provider, refresh and targeting.
 * Boundary: an override declares `override` members only and inherits the base's key
 *           (`feature_flags`). A flag is a release switch, never a commercial right (entitlements
 *           are a separate gate). Expiry and removal issues are on the Flag classes of the consumed
 *           modules; routes and menu items name them as `Flags.orders.quick_order` from
 *           `#stackra/flags`. The flags context `createApp` mounts targets the signed-in user, the
 *           active tenant and the client target. The PostHog key comes from
 *           `EnvConfig.featureFlagsPosthogKey`. The class keeps the base's name and imports the
 *           base as `BaseFeatureFlagsConfig`; a second override of the same base fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0213 d3 (flags are a settings kind), ADR 0231 (driver names
 *                     are checked literals)
 */
import type { DriverName } from "@stackra/container";
import { Duration } from "@stackra/contracts";
import {
  FeatureFlagsConfig as BaseFeatureFlagsConfig,
  FlagTargeting,
} from "@stackra/feature-flags";
import type { FlagProvider } from "@stackra/feature-flags/contracts";

/** Feature flags on the console: provider driver, build-time defaults and targeting. */
export class FeatureFlagsConfig extends BaseFeatureFlagsConfig {
  /** `config` reads values from this file and runway (dev, on-prem); `posthog` is SaaS. */
  override provider: DriverName<FlagProvider> = "config";

  /** Build-time values for the `config` provider; an unlisted flag takes its declared default. */
  override values: Record<string, boolean> = {};

  /** How often a remote provider is asked again. */
  override refreshEvery = Duration.seconds(60);

  /** Evaluate per tenant. */
  override targeting: FlagTargeting = FlagTargeting.Tenant;

  /** Fail gen on a flag past its expiry instead of warning. */
  override failOnExpired = true;
}
