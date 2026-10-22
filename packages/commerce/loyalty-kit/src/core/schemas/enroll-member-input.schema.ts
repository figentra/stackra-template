/**
 * Stackra file contract:
 * Purpose: the input of `loyalty_kit.account.enroll`: the account address, the principal and the
 *          tier.
 * Boundary: a schema class only; the tier field parses through the enum codec, so handlers receive
 *           a case. The principal travels in the body, never the path.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";

/**
 * Where the account lives (`accountId`, the path parameter, minted by the client so a retried PUT
 * addresses the same account), who to enroll (a principal public id) and at which tier; staff may
 * start a VIP at gold.
 */
export class EnrollMemberInput extends Schema(
  z.object({
    accountId: z.string().min(1),
    principalId: z.string().min(1),
    tier: LoyaltyTier.schema.default(LoyaltyTier.Bronze),
  }),
) {}
