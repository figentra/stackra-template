/**
 * Stackra file contract:
 * Purpose: what the console reports about itself: error reporting, replays, web vitals with the ADR
 *          0183 budgets, bundle budgets and trace sampling.
 * Boundary: the console's own config class (key `console.telemetry`, derived, which runway's
 *           `config.console.telemetry` layers set per environment); the shape and its defaults are
 *           `TelemetryOptions`, and no field is read from the environment, so there is no `env`
 *           map. The DSN comes from `EnvConfig.telemetryDsn`, the Sentry project is runway
 *           `telemetry.sentryProject`. No personal data: user ids only. A replay records only after
 *           the user granted the analytics consent category.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20; as amended by programming model v3.1,
 *                     AGENTS.md: `Config({ schema, env })`), ADR 0232 (reporter port), ADR 0184
 *                     (telemetry), ADR 0183 (budgets)
 */
import { Config } from "@stackra/config";
import { TelemetryOptions } from "#src/schemas/telemetry-options.schema";

/** What the console reports about itself: error reporting, replays and web vitals. */
export class TelemetryConfig extends Config({ schema: TelemetryOptions }) {}
