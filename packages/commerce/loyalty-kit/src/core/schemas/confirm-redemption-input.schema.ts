/**
 * Stackra file contract:
 * Purpose: the input of `loyalty_kit.points.confirm_redemption`: the reference a redemption was
 *          debited under.
 * Boundary: a schema class only. The member is never a field: the action takes it from the actor,
 *           or from the customer a service acts for.
 * Runtime: isomorphic
 * Governing contract: ADR 0095 (Zod), ADR 0136 (the actor is never an input field)
 */
import { Schema, z } from "@stackra/schema";

/** The same reference the caller passed to `loyalty_kit.points.redeem`. */
export class ConfirmRedemptionInput extends Schema(
  z.object({
    /** Public id of the thing paid for (`ord_…`); the path parameter of the endpoint. */
    reference: z.string().min(1).max(120),
  }),
) {}
