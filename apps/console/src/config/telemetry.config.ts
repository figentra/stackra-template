/**
 * Stackra file contract:
 * Purpose: what the console reports about itself: error reporting, replays, web vitals with the
 *          ADR 0183 budgets, bundle budgets and trace sampling.
 * Boundary: the console's own config class (key `console.telemetry`, which runway's
 *           `config.console.telemetry` layers set per environment); each nested object is typed by
 *           a shape class in `src/schemas/`. The DSN is env (`VITE_SENTRY_DSN`), the Sentry project
 *           is runway `telemetry.sentryProject`. No personal data: user ids only. A replay records
 *           only after the user granted the analytics consent category.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20), ADR 0232 (reporter port), ADR 0184
 *                     (telemetry), ADR 0183 (budgets)
 */
import { Config } from "@stackra/config";
import { ConsentCategory } from "@stackra/consent";
import type { BundleBudgets } from "#src/schemas/bundle-budgets.schema";
import type { TelemetryErrors } from "#src/schemas/telemetry-errors.schema";
import type { TelemetryTraces } from "#src/schemas/telemetry-traces.schema";
import type { TelemetryVitals } from "#src/schemas/telemetry-vitals.schema";

/** What the console reports about itself: error reporting, replays and web vitals. */
export class TelemetryConfig extends Config {
  /** Every error reported, with a replay of the seconds before it once analytics is granted. */
  errors: TelemetryErrors = {
    enabled: true,
    sampleRate: 1,
    replayOnError: true,
    replayConsent: ConsentCategory.Analytics,
  };

  /** Vitals collected from real sessions against the ADR 0183 field budgets. */
  vitals: TelemetryVitals = {
    enabled: true,
    budgets: {
      lcpMs: 2500,
      inpMs: 200,
      cls: 0.1,
    },
  };

  /** The gzipped size budgets the build enforces. */
  bundle: BundleBudgets = {
    entryKb: 200,
    routeKb: 100,
  };

  /** One trace in ten is sampled; runway raises it in dev and staging. */
  traces: TelemetryTraces = { sampleRate: 0.1 };
}
