/**
 * Stackra file contract:
 * Purpose: `TelemetryOptions`: the shape of what the console reports about itself, with the
 *          defaults: every error with a consent-gated replay, vitals against the ADR 0183 field
 *          budgets, the gzipped bundle budgets and one trace in ten. `TelemetryConfig` names it as
 *          its `schema`.
 * Boundary: a shape class; each nested object is a shape class of its own in `schemas/`. No field
 *           is read from the environment; runway's `config.console.telemetry` layers change the
 *           values per environment.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19; as amended by programming model v3.1,
 *                     AGENTS.md: `Config({ schema, env })`), ADR 0184 (telemetry), ADR 0183
 *                     (budgets)
 */
import { ConsentCategory } from "@stackra/consent";
import { Schema } from "@stackra/validation";
import type { BundleBudgets } from "#src/schemas/bundle-budgets.schema";
import type { TelemetryErrors } from "#src/schemas/telemetry-errors.schema";
import type { TelemetryTraces } from "#src/schemas/telemetry-traces.schema";
import type { TelemetryVitals } from "#src/schemas/telemetry-vitals.schema";

/** Error reporting, replays, web vitals, bundle budgets and trace sampling. */
export class TelemetryOptions extends Schema {
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
