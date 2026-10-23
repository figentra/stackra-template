/**
 * Stackra file contract:
 * Purpose: the shape of telemetry.config.ts `errors`: error reporting and the replay around an
 *          error.
 * Boundary: a shape class typing one nested config object; the values are the config's.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0232 (reporter port)
 */
import type { ConsentCategory } from "@stackra/consent";
import { Num, Schema } from "@stackra/validation";

/** Whether errors are reported, how many, and whether the seconds before one are kept. */
export class TelemetryErrors extends Schema {
  /** Report errors at all. */
  enabled!: boolean;

  /** Share of errors sent. */
  @Num({
    min: 0,
    max: 1,
  })
  sampleRate!: number;

  /** Keep the seconds before an error as a replay; never always-on (personal data risk). */
  replayOnError!: boolean;

  /** The consent category a replay needs; without it no replay is recorded. */
  replayConsent!: ConsentCategory;
}
