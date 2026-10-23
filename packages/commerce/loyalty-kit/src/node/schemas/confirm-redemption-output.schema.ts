/**
 * Stackra file contract:
 * Purpose: `ConfirmRedemptionOutput`: the output of `loyalty_kit.points.confirm_redemption@1`.
 * Boundary: a shape class in its own file; the redemption's own result arrives as the redeem
 *           action's output, so this carries only the confirmed reference.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import { Schema } from "@stackra/validation";

/** The confirmed reference. */
export class ConfirmRedemptionOutput extends Schema {
  /** The reference that was confirmed. */
  reference!: string;
}
