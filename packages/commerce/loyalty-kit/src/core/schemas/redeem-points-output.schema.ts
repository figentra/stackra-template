/**
 * Stackra file contract:
 * Purpose: the output of `loyalty_kit.points.redeem`: what was debited, what it is worth and the
 *          balance after.
 * Boundary: a schema class only.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";

/** What the caller gets back: what was debited, what it is worth, and the balance after. */
export class RedeemPointsOutput extends Schema(
  z.object({
    points: z.number().int().nonnegative(),
    amountMinor: z.number().int().nonnegative(),
    balance: z.number().int().nonnegative(),
  }),
) {}
