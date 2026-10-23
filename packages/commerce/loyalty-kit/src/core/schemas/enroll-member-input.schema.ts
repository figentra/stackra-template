/**
 * Stackra file contract:
 * Purpose: `EnrollMemberInput`: the input of `loyalty_kit.account.enroll@1`: the account address,
 *          the principal and the tier.
 * Boundary: a shape class shared by the action and the resource's create form, so it lives in
 *           schemas. The account id is the PUT address the client mints, so a retried call
 *           addresses the same account; the principal travels in the body, never the path.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 15 and 26), ADR 0136 (the actor is never an input
 *                     field)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema, Str } from "@stackra/validation";
import { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";

/** Who to enroll, at which address and tier; staff may start a VIP at gold. */
export class EnrollMemberInput extends Schema {
  /** The account's public id, minted by the client; the path parameter of the endpoint. */
  accountId!: PublicId<"lac">;

  /** The principal public id to enroll. */
  @Str({ min: 1 })
  principalId!: string;

  /** The starting tier. */
  tier: LoyaltyTier = LoyaltyTier.Bronze;
}
