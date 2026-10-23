/**
 * Stackra file contract:
 * Purpose: the shape of the minimum Lighthouse category scores inside telemetry.config.ts
 *          `lighthouse`.
 * Boundary: a shape class typing one nested config object; the values are the config's.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0183 (budgets)
 */
import { Num, Schema } from "@stackra/validation";

/** Performance, accessibility and SEO scores a measured run must reach, each from 0 to 1. */
export class LighthouseScores extends Schema {
  /** Performance. */
  @Num({
    min: 0,
    max: 1,
  })
  performance!: number;

  /** Accessibility. */
  @Num({
    min: 0,
    max: 1,
  })
  accessibility!: number;

  /** SEO. */
  @Num({
    min: 0,
    max: 1,
  })
  seo!: number;
}
