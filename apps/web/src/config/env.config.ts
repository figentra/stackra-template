/**
 * Stackra file contract:
 * Purpose: the env contract of the public site, referenced by `stackra.config.ts` `env`: the shape
 *          is `EnvOptions`, and `env` maps each field read from the environment to its variable.
 *          Public fields (`VITE_`) are inlined into the client bundle; server fields (`STACKRA_`)
 *          are read from the Worker's `env` at run time; the two secrets are named on their schema
 *          fields and synced by runway. A field named after a package config field feeds it when
 *          `createApp` layers the env over the config defaults (`analyticsPosthogKey` feeds
 *          `analytics.posthogKey`, `featureFlagsPosthogKey` feeds `feature_flags.posthogKey`,
 *          `telemetryDsn` feeds `logger.telemetry.dsn`); the generated clients read the API origin
 *          and the visitor signing key.
 * Boundary: the site's own config class (key `web.env`); the class is the token. Values per
 *           environment come from `runway.yaml`. Code reads `env.siteUrl` from `#stackra/env`,
 *           never the variable name.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md), ADR 0295
 *                     (decisions 2 and 10), ADR 0231 d4 (prefixes), ADR 0173, ADR 0237, ADR 0297
 *                     (decision 6)
 */
import { Config } from "@stackra/config";
import { EnvOptions } from "#src/schemas/env-options.schema";

/** `env` (public part) from `#stackra/env` in the browser; `serverEnv(raw)` in the Worker. */
export class EnvConfig extends Config({
  schema: EnvOptions,
  env: {
    analyticsPosthogKey: "VITE_POSTHOG_KEY",
    featureFlagsPosthogKey: "VITE_POSTHOG_KEY",
    turnstileSiteKey: "VITE_TURNSTILE_SITE_KEY",
    apiUrl: "STACKRA_API_URL",
    siteUrl: "STACKRA_SITE_URL",
    telemetryDsn: "STACKRA_SENTRY_DSN",
  },
}) {}
