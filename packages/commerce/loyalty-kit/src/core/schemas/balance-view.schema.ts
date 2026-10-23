/**
 * Stackra file contract:
 * Purpose: `BalanceView`: the output of `loyalty_kit.points.balance@1`, also the data of the
 *          points-balance widget's renderer.
 * Boundary: a shape class (an output view, so `<X>View`), shared by the query (node) and the
 *           renderer (react), so it lives in core; never the database row. `nextExpiryAt` is a
 *           `Date` in code and ISO 8601 with an offset on the wire.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 15 and 26)
 */
import { Int, Schema } from "@stackra/validation";
import type { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";

/**
 * A balance snapshot with the date the oldest live points expire, so a client can warn the member.
 */
export class BalanceView extends Schema {
  /** The member the balance belongs to. */
  memberId!: string;

  /** The account's tier. */
  tier!: LoyaltyTier;

  /** Whole points the member holds. */
  @Int({ min: 0 })
  balance!: number;

  /** When the oldest live earned points expire; null when nothing is earned. */
  nextExpiryAt!: Date | null;
}
