/**
 * Stackra file contract:
 * Purpose: `ExpirePointsOutput`: the output of the `loyalty_kit.points.expire@1` job: accounts
 *          visited and points removed.
 * Boundary: a shape class in its own file; zeros are a normal result.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import { Int, Schema } from "@stackra/validation";

/** What one run did. */
export class ExpirePointsOutput extends Schema {
  /** Accounts this run visited. */
  @Int({ min: 0 })
  accounts!: number;

  /** Points it expired across them. */
  @Int({ min: 0 })
  points!: number;
}
