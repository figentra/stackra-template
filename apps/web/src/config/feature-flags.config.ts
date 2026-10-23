/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/feature-flags' configuration: the provider by driver
 *          name, build-time values for the config provider and per-visitor targeting for
 *          experiments such as the pricing interval.
 * Boundary: an override declares `override` members only and inherits the base's key
 *           (`feature_flags`). A flag is a release switch or an experiment arm, never a commercial
 *           right. A visitor without analytics consent is evaluated anonymously at each flag's
 *           default, so no identifier is stored. Fields typed by an enum or a driver name restate
 *           their type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0213 d3 (flags are a settings kind), ADR 0231
 *                     (driver names are checked literals)
 */
import type { DriverName } from "@stackra/container";
import { FeatureFlagsConfig, FlagTargeting } from "@stackra/feature-flags";
import type { FlagProvider } from "@stackra/feature-flags/contracts";

/** Feature flags on the public site: provider driver, build-time defaults and targeting. */
export class WebFeatureFlagsConfig extends FeatureFlagsConfig {
  /** `config` in dev and on-prem, `posthog` in SaaS. */
  override provider: DriverName<FlagProvider> = "config";

  /** Build-time values for the `config` provider; an unlisted flag takes its declared default. */
  override values: Record<string, boolean> = {};

  /** Experiments split by visitor; the public site has no tenant or user. */
  override targeting: FlagTargeting = FlagTargeting.Visitor;
}
