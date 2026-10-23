/**
 * Stackra file contract:
 * Purpose: `ExpirePointsInput`: the input of the `loyalty_kit.points.expire@1` job: how many
 *          accounts one run visits.
 * Boundary: a shape class in its own file; the cron's `input` is checked against it by gen.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0148
 */
import { Int, Schema } from "@stackra/validation";

/** Accounts per run; the next tick takes the rest. */
export class ExpirePointsInput extends Schema {
  /** How many accounts one run visits; the cron passes 500. */
  @Int({
    min: 1,
    max: 5_000,
  })
  batchSize = 500;
}
