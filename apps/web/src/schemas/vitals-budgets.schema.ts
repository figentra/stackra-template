/**
 * Stackra file contract:
 * Purpose: the shape of the ADR 0183 field budgets inside telemetry.config.ts `vitals`.
 * Boundary: a shape class typing one nested config object; the values are the config's.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0183 (budgets)
 */
import { Int, Num, Schema } from "@stackra/validation";

/** Largest Contentful Paint, Interaction to Next Paint and Cumulative Layout Shift budgets. */
export class VitalsBudgets extends Schema {
  /** Largest Contentful Paint budget, in milliseconds. */
  @Int({ min: 1 })
  lcpMs!: number;

  /** Interaction to Next Paint budget, in milliseconds. */
  @Int({ min: 1 })
  inpMs!: number;

  /** Cumulative Layout Shift budget. */
  @Num({ min: 0 })
  cls!: number;
}
