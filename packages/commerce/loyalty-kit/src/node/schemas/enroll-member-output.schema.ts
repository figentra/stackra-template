/**
 * Stackra file contract:
 * Purpose: `EnrollMemberOutput`: the output of `loyalty_kit.account.enroll@1`: the account and its
 *          tier, whether it was just created or already existed.
 * Boundary: a shape class in its own file (one declaration per file); built with
 *           `EnrollMemberOutput.create`, never `new`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";

/** The account and its tier. */
export class EnrollMemberOutput extends Schema {
  /** The account's public id. */
  accountId!: PublicId<"lac">;

  /** The account's tier. */
  tier!: LoyaltyTier;
}
