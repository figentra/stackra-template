/**
 * Stackra file contract:
 * Purpose: one fact: what the app reports about itself (the client variant of telemetry config).
 *          Error and native-crash reporting, trace sampling, session replay behind consent, and the
 *          cold-start budget.
 * Boundary: the DSN is the public env (`MobileEnv.sentryDsn`), the Sentry project is `runway.yaml`
 *           `telemetry`, the org is the root runway; none of them is here. No personal data is
 *           sent: user ids only, no emails, no request bodies. Replay never starts until the user
 *           grants `ConsentCategory.CrashReplay`. Sampling per environment is `runway.yaml`
 *           `environments.<env>.config`.
 * Runtime: isomorphic
 * Governing contract: ADR 0071, ADR 0180, ADR 0184, ADR 0232
 */
import { Config } from "@stackra/config";
import { Bool, Int, Nested, Num, OneOf } from "@stackra/validation";
import { ConsentCategory } from "#src/enums/consent-category.enum";

/** Crash and error reporting through the reporter port (Sentry behind it). */
class ErrorsConfig {
  /** Report errors at all. @defaultValue true */
  @Bool() enabled = true;
  /** Share of errors sent. @defaultValue 1 */
  @Num({ min: 0, max: 1 }) sampleRate = 1;
  /** Report native crashes, not only JavaScript errors. @defaultValue true */
  @Bool() nativeCrashes = true;
}

/** Head sampling of app traces (cold start, navigation, client calls). */
class TracesConfig {
  /** Share of sessions traced. @defaultValue 0.1 */
  @Num({ min: 0, max: 1 }) sampleRate = 0.1;
}

/** Session replay attached to an error, only with consent. */
class ReplayConfig {
  /** Share of errored sessions replayed once consent is granted. @defaultValue 1 */
  @Num({ min: 0, max: 1 }) onErrorSampleRate = 1;
  /** The consent category that gates replay; gen checks it is in consent.config.ts. */
  @OneOf(ConsentCategory) consent = ConsentCategory.CrashReplay;
}

/** Budgets the performance reviewer reads; a regression is advisory, not a gate. */
class BudgetsConfig {
  /** Cold start to first route, in milliseconds. @defaultValue 1500 */
  @Int({ min: 1 }) coldStartMs = 1500;
}

/** The dev-safe defaults; runway lowers the rates per environment. */
@Config("mobile.telemetry")
export class TelemetryConfig {
  /** How crashes and errors are reported to Sentry. */
  @Nested(ErrorsConfig) errors = new ErrorsConfig();
  /** How many traces are sampled and sent. */
  @Nested(TracesConfig) traces = new TracesConfig();
  /** Session replay, recorded only after consent. */
  @Nested(ReplayConfig) replay = new ReplayConfig();
  /** The cold-start and frame budgets the app is measured against. */
  @Nested(BudgetsConfig) budgets = new BudgetsConfig();
}
