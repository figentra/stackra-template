/**
 * Stackra file contract:
 * Purpose: `LoyaltyAccountView`: one row of the account list, the public shape of a loyalty
 *          account.
 * Boundary: a shape class (an output view of the `LoyaltyAccount` model); the output of the
 *           standard list and get operations gen writes for LoyaltyAccountResource, so it is the
 *           row the resource's table and infolist keys are checked against
 *           (`Resource<LoyaltyAccount, LoyaltyAccountView>`). Never the database row, never the
 *           ledger entries.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 15 and 26)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";

/** An account as the console list and the operations return it. */
export class LoyaltyAccountView extends Schema {
  /** The account's public id. */
  accountId!: PublicId<"lac">;

  /** The principal the account belongs to. */
  memberId!: string;

  /** The current tier. */
  tier!: LoyaltyTier;

  /** Whether the account is frozen for review. */
  isFrozen!: boolean;

  /** When the account was frozen; null while active. */
  frozenAt!: Date | null;

  /** When the account was created. */
  createdAt!: Date;
}
