/**
 * Stackra file contract:
 * Purpose: the shape of telemetry.config.ts `lighthouse`: what the e2e tier measures and the scores
 *          it must reach.
 * Boundary: a shape class typing one nested config object; the values are the config's. Gen writes
 *           `.stackra/lighthouserc.yaml` from it, once per locale.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0183 (budgets)
 */
import { Int, Schema } from "@stackra/validation";
import type { LighthouseScores } from "#src/schemas/lighthouse-scores.schema";

/** The measured paths, the runs per path and the minimum scores. */
export class TelemetryLighthouse extends Schema {
  /** Paths measured per locale. */
  paths!: string[];

  /** Runs per path; the median is asserted. */
  @Int({ min: 1 })
  runs!: number;

  /** The scores a run must reach. */
  minScores!: LighthouseScores;
}
