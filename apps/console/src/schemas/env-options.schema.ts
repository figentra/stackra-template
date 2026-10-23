/**
 * Stackra file contract:
 * Purpose: `EnvOptions`: the shape of the console's env contract: the fields, their types, defaults
 *          and rules. `EnvConfig` names it as its `schema`.
 * Boundary: a shape class; which environment variable fills each field is the config's `env` map,
 *           not a decorator here. A field named after a package config field feeds that field
 *           (`analyticsPosthogKey` feeds `analytics.posthogKey`), so no override reads env. Every
 *           value is public (a browser client holds no secret), so no field carries `@Secret`. No
 *           default URL: an empty origin means same origin.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19; as amended by programming model v3.1,
 *                     AGENTS.md: `Config({ schema, env })`), ADR 0173 (no values in files)
 */
import { Target } from "@stackra/contracts";
import { Schema, Str } from "@stackra/validation";

/** The target being built, the API and realtime origins and the public keys of the console. */
export class EnvOptions extends Schema {
  /** Which target is being built; set by `stackra build --target`, never by hand. */
  target: Target = Target.Web;

  /** Origin of the gateway and the BFF; empty means same origin. On-prem changes this one value. */
  @Str({ pattern: /^(https?:\/\/[^/\s]+)?$/ })
  apiOrigin = "";

  /** Realtime origin; empty means the API origin. Feeds `realtime.origin`. */
  @Str({ pattern: /^(https?:\/\/[^/\s]+)?$/ })
  realtimeOrigin = "";

  /** Sentry DSN; empty disables browser error reporting. Public by design; feeds `telemetry.dsn`. */
  telemetryDsn = "";

  /** VAPID public key; empty disables Web Push. Feeds `platform.push.vapidPublicKey`. */
  pushVapidPublicKey = "";

  /** The public PostHog project key; empty disables sending. Feeds `analytics.posthogKey`. */
  analyticsPosthogKey = "";

  /** The same public key for the `posthog` flag provider; feeds `feature_flags.posthogKey`. */
  featureFlagsPosthogKey = "";
}
