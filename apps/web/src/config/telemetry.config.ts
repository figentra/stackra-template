/**
 * Stackra file contract:
 * Purpose: one fact: what the site reports about itself (client and Worker): error reporting, web
 *          vitals with the ADR 0183 budgets, bundle budgets, the Lighthouse paths and minimum
 *          scores, trace sampling.
 * Boundary: no DSN here (env `STACKRA_SENTRY_DSN`); the Sentry project is runway
 *           `telemetry.sentryProject`. The public site has no user, so nothing personal is sent; a
 *           replay would need the analytics consent category.
 * Runtime: isomorphic
 * Governing contract: ADR 0232 (reporter port), ADR 0184, ADR 0183 (budgets), ADR 0071 (consent)
 */
import { Config } from "@stackra/config";
import { ConsentCategory } from "@stackra/consent";
import { Bool, Int, List, Nested, Num, OneOf, Str } from "@stackra/validation";

/** Error reporting and the replay around an error. */
class ErrorsConfig {
  /** Report errors at all. @defaultValue true */
  @Bool() enabled = true;
  /** Share of errors sent. @defaultValue 1 */
  @Num({ min: 0, max: 1 }) sampleRate = 1;
  /** Keep the seconds before an error as a replay; off on the public site. @defaultValue false */
  @Bool() replayOnError = false;
  /** The consent category a replay needs. @defaultValue ConsentCategory.Analytics */
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

/** Minimum Lighthouse category scores. */
class LighthouseScores {
  /** Performance. @defaultValue 0.9 */
  @Num({ min: 0, max: 1 }) performance = 0.9;
  /** Accessibility. @defaultValue 1 */
  @Num({ min: 0, max: 1 }) accessibility = 1;
  /** SEO. @defaultValue 1 */
  @Num({ min: 0, max: 1 }) seo = 1;
}

/** What Lighthouse measures in the e2e tier. */
class LighthouseConfig {
  /** Paths measured per locale; the product page is the seeded `demo-tee`. */
  @List(Str) paths: string[] = ["/", "/pricing", "/store", "/store/demo-tee"];
  /** Runs per path; the median is asserted. @defaultValue 3 */
  @Int({ min: 1 }) runs = 3;
  /** The scores a run must reach. */
  @Nested(LighthouseScores) minScores = new LighthouseScores();
}

/** Trace sampling; runway raises it in dev and staging. */
class TracesConfig {
  /** Head sampling rate. @defaultValue 0.1 */
  @Num({ min: 0, max: 1 }) sampleRate = 0.1;
}

/** What the site reports about itself: error reporting and web vitals, for client and Worker. */
@Config("web.telemetry")
export class TelemetryConfig {
  /** How errors are reported. */
  @Nested(ErrorsConfig) errors = new ErrorsConfig();
  /** Which field vitals are collected and their budgets. */
  @Nested(VitalsConfig) vitals = new VitalsConfig();
  /** The gzipped size budgets the build enforces. */
  @Nested(BundleBudgets) bundle = new BundleBudgets();
  /** What the e2e tier measures with Lighthouse. */
  @Nested(LighthouseConfig) lighthouse = new LighthouseConfig();
  /** How many traces are sampled. */
  @Nested(TracesConfig) traces = new TracesConfig();
}
