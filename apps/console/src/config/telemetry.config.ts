/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/logger's telemetry configuration: what the console
 *          reports about itself. Error reporting, trace sampling, a replay of errored sessions
 *          behind consent, web vitals, and the field and bundle budgets.
 * Boundary: an override declares `override` members only and inherits the base's key
 *           (`logger.telemetry`, which runway's `config.logger.telemetry` layers set per
 *           environment); its presence mounts the telemetry context and starts the reporter port of
 *           @stackra/errors (Sentry behind it). Nested objects are replaced whole, so each merges
 *           the base value explicitly. The DSN is the public env value `EnvConfig.telemetryDsn`
 *           (`VITE_SENTRY_DSN`), which feeds `telemetry.dsn`; the Sentry project is runway.yaml
 *           `telemetry.sentryProject`. No personal data is sent: user ids only, no emails, no
 *           request bodies. Replay never starts until the user grants
 *           `ConsentCategory.CrashReplay` on the settings page's privacy tab. The generated Vite
 *           config fails the build over the bundle budgets. `lighthouse` keeps the base value: the
 *           console's pages sit behind sign-in, so the Lighthouse run is the public site's.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md: Base
 *                     alias), ADR 0295 (decision 10), ADR 0232 (reporter port), ADR 0184
 *                     (telemetry), ADR 0183 (budgets)
 */
import { ConsentCategory } from "@stackra/consent";
import { TelemetryConfig as BaseTelemetryConfig } from "@stackra/logger";

/** The dev-safe rates; runway lowers or raises them per environment. */
export class TelemetryConfig extends BaseTelemetryConfig {
  /** Every browser error is reported. */
  override errors = { ...this.errors, enabled: true, sampleRate: 1 };

  /** A tenth of sessions are traced (navigation, client calls); runway raises it in dev. */
  override traces = { ...this.traces, sampleRate: 0.1 };

  /** Every errored session is replayed, only once the crash-replay consent is granted. */
  override replay = {
    ...this.replay,
    onErrorSampleRate: 1,
    consent: ConsentCategory.CrashReplay,
  };

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
}
