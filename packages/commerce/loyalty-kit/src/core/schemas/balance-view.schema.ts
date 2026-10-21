/**
 * Stackra file contract:
 * Purpose: the read shape of `loyalty_kit.points.balance`, also the props of the balance tile.
 * Boundary: a schema class only; the query maps rows to the view. Never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";

/**
 * A balance snapshot with the date the oldest live points expire, so a client can warn the member.
 */
export class BalanceView extends Schema(
  z.object({
    memberId: z.string(),
    tier: LoyaltyTier.schema,
    balance: z.number().int().nonnegative(),
    nextExpiryAt: z.iso.datetime().nullable(),
  }),
) {}
