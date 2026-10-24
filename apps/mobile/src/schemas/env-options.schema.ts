/**
 * Stackra file contract:
 * Purpose: the shape of the mobile app's public env: every value the binary reads from the
 *          environment, typed, with its default. `EnvConfig` names it as its `schema` and maps each
 *          field to its `EXPO_PUBLIC_*` variable in its `env` map.
 * Boundary: a schema class: the property types are the rules, the initializers the defaults, and
 *           gen compiles it to the Zod schema of `EnvConfig`. `!:` marks a value every environment
 *           must set; `stackra validate` fails on a missing one against runway.yaml `vars`, not the
 *           app at boot. A field a package's context reads is named `<package><Field>` after the
 *           config field it feeds (`identityIssuer` feeds `identity.issuer`), the partner-by-name
 *           rule, so gen binds it without a second declaration and records the binding in
 *           stackra.manifest.json `env.public`. Nothing here is a secret: a native client holds
 *           none.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0295 (decisions 2 and 4), ADR 0173, ADR 0231
 */
import type { Url } from "@stackra/contracts";
import type { DriverName } from "@stackra/container";
import type { PushTransport } from "@stackra/platform/contracts";
import { Schema, Str } from "@stackra/validation";

/** The public values of the binary, one field per `EXPO_PUBLIC_*` variable. */
export class EnvOptions extends Schema {
  /**
   * EAS project id; the generated Expo config builds the update URL from it. Empty in a clone.
   */
  easProjectId = "";

  /** Origin of the generated gateway the clients call. */
  apiOrigin!: Url;

  /**
   * Origin of universal links (`<origin>/m/...`): the console's, which serves the two association
   * files under `/.well-known/` and opens the matching console page for a visitor without the app.
   */
  appOrigin!: Url;

  /** Origin of the realtime gateway (`ws:` or `wss:`); feeds `realtime.origin`. */
  realtimeOrigin!: Url;

  /** Issuer of the identity provider the PKCE flow discovers; feeds `identity.issuer`. */
  identityIssuer!: Url;

  /** The native app's public client id (PKCE, no credential); feeds `identity.clientId`. */
  @Str({ min: 1 })
  identityClientId!: string;

  /**
   * Sentry DSN; empty disables crash reporting. Public by design; feeds `logger.telemetry.dsn`.
   */
  telemetryDsn = "";

  /** The registered push transport; feeds `platform.push.provider`. */
  pushProvider: DriverName<PushTransport> = "expo";

  /**
   * The public PostHog project key; empty disables sending. Feeds `analytics.posthogKey`.
   */
  analyticsPosthogKey = "";

  /** The same public key for the `posthog` flag provider; feeds `feature_flags.posthogKey`. */
  featureFlagsPosthogKey = "";
}
