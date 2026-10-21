/**
 * Stackra file contract:
 * Purpose: the input of `loyalty_kit.points.redeem`: points to spend, the idempotent reference and
 *          the amount still to pay.
 * Boundary: a schema class only (value and type under one name). A DTO is never `new`-ed:
 *           `RedeemPointsInput.parse(x)` returns a plain object typed as `RedeemPointsInput`. The
 *           actor is never a field.
 * Runtime: isomorphic
 * Governing contract: ADR 0095 (Zod), ADR 0136 (the actor is never an input field), ADR 0128
 */
import { Schema, z } from "@stackra/schema";
import { MAX_POINTS_PER_ENTRY } from "#core/constants/max-points-per-entry.constant";

/**
 * What a caller sends: how many points to spend, the reference the debit is idempotent on, and the
 * amount still to pay.
 */
export class RedeemPointsInput extends Schema(
  z.object({
    /** Whole points to spend; the workflow caps it by balance and by the configured percentage. */
    points: z.number().int().min(1).max(MAX_POINTS_PER_ENTRY),
    /** Public id of the thing paid for (`ord_…`); a repeated reference debits nothing twice. */
    reference: z.string().min(1).max(120),
    /** The amount still to pay, in minor units, so the percentage cap can be applied. */
    totalMinor: z.number().int().nonnegative(),
  }),
) {}
