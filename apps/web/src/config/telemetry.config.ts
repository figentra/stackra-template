/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/logger's telemetry configuration: what the site reports
 *          about itself, in the browser and on the Worker. Error reporting, trace sampling, web
 *          vitals with the ADR 0183 field budgets, the bundle budgets, and the Lighthouse paths
 *          and minimum scores of the e2e tier.
 * Boundary: an override declares `override` members only and inherits the base's key
 *           (`logger.telemetry`), which runway's `config.logger.telemetry` layers set per
 *           environment; its presence mounts the telemetry context and starts the reporter port of
 *           @stackra/errors. Nested objects are replaced whole, so each merges the base value
 *           explicitly. The DSN is the public env value `EnvConfig.telemetryDsn`
 *           (`VITE_SENTRY_DSN`), which the browser and the Worker read from the same build; the
 *           Sentry project is runway.yaml `telemetry.sentryProject`. No replay on the public site,
 *           and no identity is attached.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md: Base
 *                     alias), ADR 0232 (reporter port), ADR 0184, ADR 0183 (budgets)
 */
import { TelemetryConfig as BaseTelemetryConfig } from "@stackra/logger";

/** The dev-safe rates; runway raises or lowers them per environment. */
export class TelemetryConfig extends BaseTelemetryConfig {
  /** Every error, browser and Worker, is reported. */
  override errors = { ...this.errors, enabled: true, sampleRate: 1 };

  /** One trace in ten is sampled; runway raises it in dev and staging. */
  override traces = { ...this.traces, sampleRate: 0.1 };

  /** No session replay on the public site, not even around an error. */
  override replay = { ...this.replay, onErrorSampleRate: 0 };

  /** Core Web Vitals are collected from real sessions. */
  override vitals = { ...this.vitals, enabled: true };

  /**
   * The ADR 0183 field budgets (LCP and INP in milliseconds, CLS a plain score) and the gzipped
   * bundle budgets in kilobytes; a field regression is advisory, a bundle over budget fails the
   * build.
   */
  override budgets = {
    ...this.budgets,
    lcpMs: 2500,
    inpMs: 200,
    cls: 0.1,
    entryKb: 200,
    routeKb: 100,
  };

  /** What the e2e tier measures per locale; the product page is the seeded `demo-tee`. */
  override lighthouse = {
    ...this.lighthouse,
    paths: ["/", "/pricing", "/store", "/store/demo-tee"],
    runs: 3,
    minScores: { performance: 0.9, accessibility: 1, seo: 1 },
  };
}
