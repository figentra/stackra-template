/**
 * Stackra file contract:
 * Purpose: `RedeemPointsOutput`: the output of `loyalty_kit.points.redeem@1`: what was debited,
 *          what it is worth and the balance after.
 * Boundary: a shape class in its own file, returned by the action and built by the workflow's
 *           `output`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import { Int, Schema } from "@stackra/validation";

/** What the caller gets back. */
export class RedeemPointsOutput extends Schema {
  /** Points debited. */
  @Int({ min: 0 })
  points!: number;

  /** The discount those points bought, in minor units. */
  @Int({ min: 0 })
  amountMinor!: number;

  /** The member's balance after the debit. */
  @Int({ min: 0 })
  balance!: number;
}
