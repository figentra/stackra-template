/**
 * Stackra file contract:
 * Purpose: the shape of what the site reports about itself (client and Worker), with its defaults:
 *          error reporting, web vitals with the ADR 0183 budgets, bundle budgets, the Lighthouse
 *          paths and minimum scores, and trace sampling.
 * Boundary: a shape class read by `TelemetryConfig`; each nested object is typed by its own shape
 *           class in this folder. No DSN here (`EnvConfig.telemetryDsn`). The public site has no
 *           user, so nothing personal is sent; a replay would need the analytics consent category.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md), ADR 0232
 *                     (reporter port), ADR 0184, ADR 0183 (budgets)
 */
import { ConsentCategory } from "@stackra/consent";
import { Schema } from "@stackra/validation";
import type { BundleBudgets } from "#src/schemas/bundle-budgets.schema";
import type { TelemetryErrors } from "#src/schemas/telemetry-errors.schema";
import type { TelemetryLighthouse } from "#src/schemas/telemetry-lighthouse.schema";
import type { TelemetryTraces } from "#src/schemas/telemetry-traces.schema";
import type { TelemetryVitals } from "#src/schemas/telemetry-vitals.schema";

/** Error reporting, vitals, bundle and Lighthouse budgets, and trace sampling. */
export class TelemetryOptions extends Schema {
  /** Every error reported; no replay on the public site. */
  errors: TelemetryErrors = {
    enabled: true,
    sampleRate: 1,
    replayOnError: false,
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

  /** The gzipped size budgets the generated Vite config enforces. */
  bundle: BundleBudgets = {
    entryKb: 200,
    routeKb: 100,
  };

  /** What the e2e tier measures with Lighthouse; the product page is the seeded `demo-tee`. */
  lighthouse: TelemetryLighthouse = {
    paths: ["/", "/pricing", "/store", "/store/demo-tee"],
    runs: 3,
    minScores: {
      performance: 0.9,
      accessibility: 1,
      seo: 1,
    },
  };

  /** One trace in ten is sampled; runway raises it in dev and staging. */
  traces: TelemetryTraces = { sampleRate: 0.1 };
}
