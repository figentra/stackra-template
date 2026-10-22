/**
 * Stackra file contract:
 * Purpose: one fact: feature flags on the public site. The provider by driver name, build-time
 *          values for the config provider, and per-visitor targeting for experiments such as the
 *          pricing interval.
 * Boundary: a flag is a release switch or an experiment arm, never a commercial right. A visitor
 *           without analytics consent is evaluated anonymously at each flag's default, so no
 *           identifier is stored.
 * Runtime: isomorphic
 * Governing contract: ADR 0213 d3 (flags are a settings kind), ADR 0071 (consent)
 */
import { Config, DriverOf } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { FlagTargeting } from "@stackra/feature-flags";
import { FlagProvider } from "@stackra/feature-flags/contracts";
import { Bool, Map, OneOf } from "@stackra/validation";

/** Feature flags on the public site: provider driver, build-time defaults and targeting. */
@Config("web.flags")
export class FeatureFlagsConfig {
  /** `config` in dev and on-prem, `posthog` in SaaS. @defaultValue "config" */
  @DriverOf(FlagProvider) provider: DriverName<FlagProvider> = "config";
  /**
   * Build-time values for the `config` provider; an unlisted flag takes its declared default.
   * @defaultValue {}
   */
  @Map(Bool) values: Record<string, boolean> = {};
  /**
   * Experiments split by visitor; the public site has no tenant or user.
   * @defaultValue FlagTargeting.Visitor
   */
  @OneOf(FlagTargeting) targeting = FlagTargeting.Visitor;
}
