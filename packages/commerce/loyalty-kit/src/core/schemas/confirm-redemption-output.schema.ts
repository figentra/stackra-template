/**
 * Stackra file contract:
 * Purpose: the output of `loyalty_kit.points.confirm_redemption`: the reference that was confirmed.
 * Boundary: a schema class only.
 * Runtime: isomorphic
 * Governing contract: ADR 0095
 */
import { Schema, z } from "@stackra/schema";

/** The confirmed reference; the redemption's own result arrives as the redeem action's output. */
export class ConfirmRedemptionOutput extends Schema(z.object({ reference: z.string() })) {}
