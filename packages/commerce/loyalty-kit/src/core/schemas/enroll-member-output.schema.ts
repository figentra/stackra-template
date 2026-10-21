/**
 * Stackra file contract:
 * Purpose: the output of `loyalty_kit.account.enroll`: the account and its tier.
 * Boundary: a schema class only.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";

/** The account's public id and tier, whether it was just created or already existed. */
export class EnrollMemberOutput extends Schema(
  z.object({ accountId: z.string(), tier: LoyaltyTier.schema }),
) {}
