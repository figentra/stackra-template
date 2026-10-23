/**
 * Stackra file contract:
 * Purpose: what the site reports about itself, client and Worker (the shape is `TelemetryOptions`):
 *          error reporting, web vitals with the ADR 0183 budgets, bundle budgets, the Lighthouse
 *          paths and minimum scores, and trace sampling.
 * Boundary: the site's own config class (key `web.telemetry`, which runway's `config.web.telemetry`
 *           layers set per environment); nothing is read from the environment, so it maps no env.
 *           No DSN here (`EnvConfig.telemetryDsn`); the Sentry project is runway
 *           `telemetry.sentryProject`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md), ADR 0232
 *                     (reporter port), ADR 0184, ADR 0183 (budgets)
 */
import { Config } from "@stackra/config";
import { TelemetryOptions } from "#src/schemas/telemetry-options.schema";

/** What the site reports about itself: error reporting and web vitals, for client and Worker. */
export class TelemetryConfig extends Config({ schema: TelemetryOptions }) {}
