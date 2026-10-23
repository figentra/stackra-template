/**
 * Stackra file contract:
 * Purpose: the env contract of the console, referenced by `stackra.config.ts` `env`. Every field is
 *          public and inlined into the bundle (`VITE_`); values per environment come from
 *          `runway.yaml` `environments.<env>.vars`. It is the one place the console reads the
 *          environment: a field named after a package config field feeds that field
 *          (`realtimeOrigin` → `realtime.origin`, `telemetryDsn` → `telemetry.dsn`,
 *          `pushVapidPublicKey` → `platform.push.vapidPublicKey`, `analyticsPosthogKey` →
 *          `analytics.posthogKey`, `featureFlagsPosthogKey` → `feature_flags.posthogKey`); the
 *          generated clients and the session read `apiOrigin`. Config overrides carry no `env`.
 * Boundary: the console's own config class (key `console.env`, derived from the class). `schema` is
 *           the shape (`EnvOptions`), `env` maps each field to its environment variable; gen checks
 *           every name against the `VITE_` prefix and the runway vars. No secret (a browser client
 *           holds none), no `.env`, no default URL. The desktop update feed is not env: gen derives
 *           it from the root feed origin, the member's feed path and the channel.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20; as amended by programming model v3.1,
 *                     AGENTS.md: `Config({ schema, env })`), ADR 0295 (decisions 2 and 10), ADR
 *                     0231 d4 (prefixes), ADR 0173 (no values in files)
 */
import { Config } from "@stackra/config";
import { EnvOptions } from "#src/schemas/env-options.schema";

/** Read as `env` from `#stackra/env`, validated once at boot. */
export class EnvConfig extends Config({
  schema: EnvOptions,
  env: {
    target: "VITE_TARGET",
    apiOrigin: "VITE_API_ORIGIN",
    realtimeOrigin: "VITE_REALTIME_ORIGIN",
    telemetryDsn: "VITE_SENTRY_DSN",
    pushVapidPublicKey: "VITE_WEB_PUSH_VAPID_PUBLIC_KEY",
    analyticsPosthogKey: "VITE_POSTHOG_KEY",
    featureFlagsPosthogKey: "VITE_POSTHOG_KEY",
  },
}) {}
