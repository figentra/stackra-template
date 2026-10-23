/**
 * Stackra file contract:
 * Purpose: the shape of the public site's env contract: the public fields (inlined into the client
 *          bundle), the server fields (read from the Worker's `env` per request) and the two
 *          secrets, by field, with their defaults. `EnvConfig` maps each environment-read field to
 *          its variable name; the secrets are named on their fields. A field a package's context
 *          reads is named `<package><Field>` after the config field it feeds (`analyticsPosthogKey`
 *          feeds `analytics.posthogKey`), so gen binds it without a second declaration; the package
 *          overrides in src/config/ carry no env of their own.
 * Boundary: a shape class; values per environment come from `runway.yaml`. No default URL: a
 *           required field with no value in some environment fails `stackra validate`, not
 *           production boot. A secret field holds a name the Worker's `env` resolves, never a
 *           value.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md), ADR 0173 (no
 *                     values in files), ADR 0297 (decision 6)
 */
import { Secret } from "@stackra/config";
import type { Url } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** What the site reads from its environment; code reads `env.siteUrl`, never a variable name. */
export class EnvOptions extends Schema {
  /**
   * The public PostHog project key, gated by consent; empty disables sending. Feeds
   * `analytics.posthogKey`.
   */
  analyticsPosthogKey = "";

  /** The same public key for the `posthog` flag provider; feeds `feature_flags.posthogKey`. */
  featureFlagsPosthogKey = "";

  /** Turnstile site key rendered in the contact form; its pair is `turnstileSecret`. */
  turnstileSiteKey!: string;

  /** The gateway origin the Worker reads the public area from. */
  apiUrl!: Url;

  /** The canonical origin; absolute URLs in sitemaps, canonicals and OG tags are built from it. */
  siteUrl!: Url;

  /**
   * Sentry DSN of the Worker and the browser; empty disables error reporting. Feeds
   * `logger.telemetry.dsn`.
   */
  telemetryDsn = "";

  /** The Turnstile secret, verified in the contact submit. */
  @Secret("TURNSTILE_SECRET_KEY")
  turnstileSecret!: string;

  /** The HMAC key the Worker signs the visitor's address with; the API verifies with the same. */
  @Secret("GATEWAY_VISITOR_SIGNING_KEY")
  visitorSigningKey!: string;
}
