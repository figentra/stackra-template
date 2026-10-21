/**
 * Stackra file contract:
 * Purpose: one fact: what the console reports about itself: error reporting, replays, web vitals
 *          with the ADR 0183 budgets, bundle budgets, trace sampling.
 * Boundary: the DSN is env (`VITE_SENTRY_DSN`), the Sentry project is runway
 *           `telemetry.sentryProject`. No personal data: user ids only. A replay records only after
 *           the user granted the analytics consent category.
 * Runtime: isomorphic
 * Governing contract: ADR 0232 (reporter port), ADR 0184 (telemetry), ADR 0183 (budgets), ADR 0071
 *                     (consent)
 */
import { Config } from "@stackra/config";
import { ConsentCategory } from "@stackra/consent";
import { Bool, Int, Nested, Num, OneOf } from "@stackra/validation";

/** Error reporting and the replay around an error. */
class ErrorsConfig {
  /** Report errors at all. @defaultValue true */
  @Bool() enabled = true;
  /** Share of errors sent. @defaultValue 1 */
  @Num({ min: 0, max: 1 }) sampleRate = 1;
  /**
   * Keep the seconds before an error as a replay; never always-on (PII risk).
   * @defaultValue true
   */
  @Bool() replayOnError = true;
  /**
   * The consent category a replay needs; without it no replay is recorded.
   * @defaultValue ConsentCategory.Analytics
   */
  @OneOf(ConsentCategory) replayConsent = ConsentCategory.Analytics;
}

/** The ADR 0183 field budgets. */
class VitalsBudgets {
  /** Largest Contentful Paint budget. @defaultValue 2500 */
  @Int({ min: 1 }) lcpMs = 2500;
  /** Interaction to Next Paint budget. @defaultValue 200 */
  @Int({ min: 1 }) inpMs = 200;
  /** Cumulative Layout Shift budget. @defaultValue 0.1 */
  @Num({ min: 0 }) cls = 0.1;
}

/** Web vitals collection. */
class VitalsConfig {
  /** Collect vitals from real sessions. @defaultValue true */
  @Bool() enabled = true;
  /** The budgets a regression is measured against. */
  @Nested(VitalsBudgets) budgets = new VitalsBudgets();
}

/** Gzipped kilobytes; the generated Vite config fails the build over budget. */
class BundleBudgets {
  /** Entry chunk budget. @defaultValue 200 */
  @Int({ min: 1 }) entryKb = 200;
  /** Per-route chunk budget. @defaultValue 100 */
  @Int({ min: 1 }) routeKb = 100;
}

/** Trace sampling; runway raises it in dev and staging. */
class TracesConfig {
  /** Head sampling rate. @defaultValue 0.1 */
  @Num({ min: 0, max: 1 }) sampleRate = 0.1;
}

/** What the console reports about itself: error reporting, replays and web vitals. */
@Config("console.telemetry")
export class TelemetryConfig {
  /** How errors and their replays are reported. */
  @Nested(ErrorsConfig) errors = new ErrorsConfig();
  /** Which field vitals are collected and their budgets. */
  @Nested(VitalsConfig) vitals = new VitalsConfig();
  /** The gzipped size budgets the build enforces. */
  @Nested(BundleBudgets) bundle = new BundleBudgets();
  /** How many traces are sampled. */
  @Nested(TracesConfig) traces = new TracesConfig();
}
