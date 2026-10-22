/**
 * Stackra file contract:
 * Purpose: one fact: feature flags on the device: the provider by name, its public key, build-time
 *          values and how often values refresh.
 * Boundary: a flag is a release switch, never a commercial right (entitlements are). Flags are
 *           declared by services (`@Flag`) and read through `#stackra/flags`. The generated entry
 *           mounts the flags context from this class, targeted by the signed-in user and the active
 *           tenant, by id only; the app writes no flags provider. Kill switches are evaluated
 *           server-side and cannot be overridden here.
 * Runtime: react-native
 * Governing contract: ADR 0081, ADR 0213
 */
import { Config, DriverOf, Env } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { FlagProvider } from "@stackra/feature-flags/contracts";
import { Bool, Duration, Map, Str } from "@stackra/validation";

/** Feature flags on the phone: provider, key, build-time values, refresh. */
@Config("mobile.flags")
export class FeatureFlagsConfig {
  /** `config` (values from this file and runway) or `posthog`. @defaultValue "config" */
  @DriverOf(FlagProvider) provider: DriverName<FlagProvider> = "config";
  /** The public PostHog key the `posthog` provider uses. */
  @Env("EXPO_PUBLIC_POSTHOG_KEY") @Str({ allowEmpty: true }) posthogKey = "";
  /** Build-time values for the `config` provider; an unlisted flag takes its declared default. */
  @Map(Bool) values: Record<string, boolean> = {};
  /** How often values refresh while the app is in the foreground. @defaultValue "60s" */
  @Duration() refreshEvery = "60s";
}
