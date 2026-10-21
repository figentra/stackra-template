/**
 * Stackra file contract:
 * Purpose: the env contract of the public site, referenced by `stackra.config.ts` `env`. Public
 *          fields (`VITE_`) are inlined into the client bundle; server fields (`STACKRA_`) are read
 *          from the Worker's `env` at run time; the secret is a name runway syncs. Values per
 *          environment come from `runway.yaml`.
 * Boundary: no default URL here; a required field with no value in some environment fails `stackra
 *           validate`, not production boot. Code reads `env.siteUrl`, never the variable name.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 d4 (prefixes), ADR 0173 (no values), ADR 0237
 */
import { Config, Env, Secret } from "@stackra/config";
import { Str, Url } from "@stackra/validation";

/**
 * `env` (public part) from `#stackra/env` in the browser; `serverEnv(raw)` (whole class) in the
 * Worker.
 */
@Config("web.env")
export class WebEnv {
  /**
   * PostHog project key; public by design, gated by consent. Empty disables analytics.
   * @defaultValue ""
   */
  @Env("VITE_POSTHOG_KEY") @Str() posthogKey = "";
  /**
   * Turnstile site key rendered in the contact form; the matching secret is `TURNSTILE_SECRET_KEY`.
   */
  @Env("VITE_TURNSTILE_SITE_KEY") @Str() turnstileSiteKey!: string;
  /** The gateway origin the Worker reads the public area from. */
  @Env("STACKRA_API_URL") @Url() apiUrl!: string;
  /** The canonical origin; absolute URLs in sitemaps, canonicals and OG tags are built from it. */
  @Env("STACKRA_SITE_URL") @Url() siteUrl!: string;
  /** Sentry DSN of the Worker and the browser; empty disables error reporting. @defaultValue "" */
  @Env("STACKRA_SENTRY_DSN") @Str() sentryDsn = "";
  /**
   * The Turnstile secret, verified in the contact submit; a reference the Worker's `env` resolves.
   */
  @Secret("TURNSTILE_SECRET_KEY") turnstileSecret!: string;
}
