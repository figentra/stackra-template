/**
 * Stackra file contract:
 * Purpose: what the site reports about itself (client and Worker): error reporting, web vitals
 *          with the ADR 0183 budgets, bundle budgets, the Lighthouse paths and minimum scores, and
 *          trace sampling.
 * Boundary: the site's own config class (key `web.telemetry`, which runway's `config.web.telemetry`
 *           layers set per environment); each nested object is typed by a shape class in
 *           `src/schemas/`. No DSN here (env `STACKRA_SENTRY_DSN`); the Sentry project is runway
 *           `telemetry.sentryProject`. The public site has no user, so nothing personal is sent; a
 *           replay would need the analytics consent category.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20), ADR 0232 (reporter port), ADR 0184, ADR 0183
 *                     (budgets)
 */
import { Config } from "@stackra/config";
import { ConsentCategory } from "@stackra/consent";
import type { BundleBudgets } from "#src/schemas/bundle-budgets.schema";
import type { TelemetryErrors } from "#src/schemas/telemetry-errors.schema";
import type { TelemetryLighthouse } from "#src/schemas/telemetry-lighthouse.schema";
import type { TelemetryTraces } from "#src/schemas/telemetry-traces.schema";
import type { TelemetryVitals } from "#src/schemas/telemetry-vitals.schema";

/** What the site reports about itself: error reporting and web vitals, for client and Worker. */
export class TelemetryConfig extends Config {
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
