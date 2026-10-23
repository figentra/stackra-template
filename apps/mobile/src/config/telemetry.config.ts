/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/logger's telemetry configuration: what the app reports
 *          about itself. Error and native-crash reporting, trace sampling, session replay behind
 *          consent, and the cold-start budget.
 * Boundary: an override declares `override` members only and inherits the base's key
 *           (`logger.telemetry`); its presence mounts the telemetry context and starts the reporter
 *           port of @stackra/errors (Sentry behind it). Nested objects are replaced whole, so each
 *           merges the base value explicitly. The DSN is a public env value; the Sentry project is
 *           runway.yaml `telemetry`, the organisation the root runway. No personal data is sent:
 *           user ids only, no emails, no request bodies. Replay never starts until the user grants
 *           `ConsentCategory.CrashReplay`. Sampling per environment is runway.yaml
 *           `environments.<env>.config`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0295 (decision 10), ADR 0071, ADR 0180,
 *                     ADR 0184, ADR 0232
 */
import { Env } from "@stackra/config";
import { TelemetryConfig } from "@stackra/logger";
import { ConsentCategory } from "#src/enums/consent-category.enum";

/** The dev-safe rates; runway lowers them per environment. */
export class MobileTelemetryConfig extends TelemetryConfig {
  /** Sentry DSN; empty disables crash reporting. Public by design. */
  @Env("EXPO_PUBLIC_SENTRY_DSN")
  override dsn = "";

  /** Every error and native crash is reported. */
  override errors = { ...this.errors, enabled: true, sampleRate: 1, nativeCrashes: true };

  /** A tenth of sessions are traced (cold start, navigation, client calls). */
  override traces = { ...this.traces, sampleRate: 0.1 };

  /** Every errored session is replayed, only once the crash-replay consent is granted. */
  override replay = {
    ...this.replay,
    onErrorSampleRate: 1,
    consent: ConsentCategory.CrashReplay,
  };

  /** Cold start to first route, in milliseconds; a regression is advisory, not a gate. */
  override budgets = { ...this.budgets, coldStartMs: 1500 };
}
