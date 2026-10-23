/**
 * Stackra file contract:
 * Purpose: `RedeemPointsInput`: the input of `loyalty_kit.points.redeem@1`: points to spend, the
 *          idempotent reference and the amount still to pay.
 * Boundary: a shape class in its own file, read by the action, the workflow and the `redeemVerify`
 *           slot of the extension point. Built with `RedeemPointsInput.create`, never `new`. The
 *           actor is never a field.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0136 (the actor is never an input field)
 */
import { Int, Schema, Str } from "@stackra/validation";
import { MAX_POINTS_PER_ENTRY } from "#core/constants/max-points-per-entry.constant";

/**
 * What a caller sends: how many points to spend, the reference the debit is idempotent on, and the
 * amount still to pay.
 */
export class RedeemPointsInput extends Schema {
  /** Whole points to spend; the workflow caps it by balance and by the configured percentage. */
  @Int({
    min: 1,
    max: MAX_POINTS_PER_ENTRY,
  })
  points!: number;

  /** Public id of the thing paid for (`ord_…`); a repeated reference debits nothing twice. */
  @Str({
    min: 1,
    max: 120,
  })
  reference!: string;

  /** The amount still to pay, in minor units, so the percentage cap can be applied. */
  @Int({ min: 0 })
  totalMinor!: number;
}
