/**
 * Stackra file contract:
 * Purpose: the env contract of the public site, referenced by `stackra.config.ts` `env`. Public
 *          fields (`VITE_`) are inlined into the client bundle; server fields (`STACKRA_`) are read
 *          from the Worker's `env` at run time; the secrets are names runway syncs. Values per
 *          environment come from `runway.yaml`. The contexts `createApp` mounts read these fields
 *          by name: the clients the API origin, the reporter the DSN, analytics and flags the
 *          PostHog key; the generated clients the visitor signing key, so the API can trust the
 *          forwarded visitor address.
 * Boundary: the site's own config class (key `web.env`). No default URL here; a required field with
 *           no value in some environment fails `stackra validate`, not production boot. Code reads
 *           `env.siteUrl`, never the variable name.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20), ADR 0295 (decisions 2 and 10), ADR 0231 d4
 *                     (prefixes), ADR 0173 (no values in files), ADR 0237, ADR 0297 (decision 6)
 */
import { Config, Env, Secret } from "@stackra/config";
import type { Url } from "@stackra/contracts";

/** `env` (public part) from `#stackra/env` in the browser; `serverEnv(raw)` in the Worker. */
export class WebEnvConfig extends Config {
  /** PostHog project key; public by design, gated by consent. Empty disables analytics. */
  @Env("VITE_POSTHOG_KEY")
  posthogKey = "";

  /** Turnstile site key rendered in the contact form; its secret is `TURNSTILE_SECRET_KEY`. */
  @Env("VITE_TURNSTILE_SITE_KEY")
  turnstileSiteKey!: string;

  /** The gateway origin the Worker reads the public area from. */
  @Env("STACKRA_API_URL")
  apiUrl!: Url;

  /** The canonical origin; absolute URLs in sitemaps, canonicals and OG tags are built from it. */
  @Env("STACKRA_SITE_URL")
  siteUrl!: Url;

  /** Sentry DSN of the Worker and the browser; empty disables error reporting. */
  @Env("STACKRA_SENTRY_DSN")
  sentryDsn = "";

  /** The Turnstile secret, verified in the contact submit; a name the Worker's `env` resolves. */
  @Secret("TURNSTILE_SECRET_KEY")
  turnstileSecret!: string;

  /** The HMAC key the Worker signs the visitor's address with; the API verifies with the same. */
  @Secret("GATEWAY_VISITOR_SIGNING_KEY")
  visitorSigningKey!: string;
}
