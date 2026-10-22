/**
 * Stackra file contract:
 * Purpose: one row of the account list: the public shape of a loyalty account.
 * Boundary: a schema class only; the list output is a `Page` of it. Never the database row, never
 *           the ledger entries.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";

/** An account as the console list and the `@Crud` list query return it. */
export class LoyaltyAccountView extends Schema(
  z.object({
    accountId: z.string(),
    memberId: z.string(),
    tier: LoyaltyTier.schema,
    isFrozen: z.boolean(),
    createdAt: z.iso.datetime(),
  }),
) {}
