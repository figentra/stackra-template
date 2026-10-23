/**
 * Stackra file contract:
 * Purpose: the fact that points were credited. Leaves through the host's outbox as
 *          `loyalty_kit.points.earned.v2`.
 * Boundary: an integration event at version 2: it added the tier and the balance after, so
 *           consumers need no second call. points-earned-v1.change.ts beside this file converts
 *           both ways, so v1 is published too until its sunset and stored v1 rows read as v2.
 *           Recorded by AccountService#earn after the ledger entry is written.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141, ADR 0131 (deprecation window)
 */
import { IntegrationEvent } from "@stackra/events";
import { Int } from "@stackra/validation";
import type { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";

/** The balance is read in the same transaction as the credit. */
export class PointsEarned extends IntegrationEvent({
  name: "points.earned",
  version: 2,
}) {
  /** The member credited. */
  memberId!: string;

  /** Points credited. */
  @Int
  points!: number;

  /** What caused the credit (an order id). */
  reference!: string;

  /** The member's tier when the credit was made. */
  tier!: LoyaltyTier;

  /** The member's balance after the credit. */
  @Int
  balanceAfter!: number;
}
