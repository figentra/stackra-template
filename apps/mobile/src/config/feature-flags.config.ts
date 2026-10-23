/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/feature-flags' configuration: the provider by name, its
 *          public key, build-time values and how often values refresh.
 * Boundary: an override declares `override` members only and inherits the base's key; its presence
 *           mounts the flags context, targeted by the signed-in user and the active tenant by id
 *           only, so the app writes no flags provider. A flag is a release switch, never a
 *           commercial right (entitlements are). Flags are declared by services (`extends Flag`)
 *           and read through `#stackra/flags`. Kill switches are evaluated server-side and cannot
 *           be overridden here. A driver-name field restates its type.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 19), ADR 0295 (decision 10), ADR 0081, ADR 0213
 */
import { Env } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { Duration } from "@stackra/contracts";
import { FeatureFlagsConfig } from "@stackra/feature-flags";
import type { FlagProvider } from "@stackra/feature-flags/contracts";

/** Flags from this file and runway by default; PostHog when runway selects it. */
export class MobileFeatureFlagsConfig extends FeatureFlagsConfig {
  /** `config` (values from this file and runway) or `posthog`. */
  override provider: DriverName<FlagProvider> = "config";

  /** The public PostHog key the `posthog` provider uses. */
  @Env("EXPO_PUBLIC_POSTHOG_KEY")
  override posthogKey = "";

  /** Build-time values for the `config` provider; an unlisted flag takes its declared default. */
  override values: Record<string, boolean> = {};

  /** How often values refresh while the app is in the foreground. */
  override refreshEvery = Duration.seconds(60);
}
