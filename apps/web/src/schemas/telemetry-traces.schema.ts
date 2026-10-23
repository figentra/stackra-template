/**
 * Stackra file contract:
 * Purpose: the shape of telemetry.config.ts `traces`: trace sampling.
 * Boundary: a shape class typing one nested config object; the values are the config's, and runway
 *           raises the rate in dev and staging.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0184 (telemetry)
 */
import { Num, Schema } from "@stackra/validation";

/** The head sampling rate of traces. */
export class TelemetryTraces extends Schema {
  /** Head sampling rate. */
  @Num({
    min: 0,
    max: 1,
  })
  sampleRate!: number;
}
