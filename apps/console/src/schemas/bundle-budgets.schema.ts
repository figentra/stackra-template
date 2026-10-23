/**
 * Stackra file contract:
 * Purpose: the shape of telemetry.config.ts `bundle`: the gzipped size budgets the generated Vite
 *          config fails the build over.
 * Boundary: a shape class typing one nested config object; the values are the config's.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0183 (budgets)
 */
import { Int, Schema } from "@stackra/validation";

/** Gzipped kilobytes for the entry chunk and for each route chunk. */
export class BundleBudgets extends Schema {
  /** Entry chunk budget, in gzipped kilobytes. */
  @Int({ min: 1 })
  entryKb!: number;

  /** Per-route chunk budget, in gzipped kilobytes. */
  @Int({ min: 1 })
  routeKb!: number;
}
