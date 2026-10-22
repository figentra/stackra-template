/**
 * Stackra file contract:
 * Purpose: the context the `LoyaltyHooks.earnAdjust` chain receives: who earns, at which tier, for
 *          what amount.
 * Boundary: a DTO the chain reads and never changes; the transformed value is the points number
 *           itself.
 * Runtime: isomorphic
 * Governing contract: ADR 0265 decision 1 (transform receives a value and context arguments)
 */
import type { LoyaltyTier } from "#core/enums/loyalty-tier.enum";
import type { MemberId } from "#core/types/member-id.type";

/** An earn in progress. */
export interface EarnDraft {
  /** The member who earns, branded so no other id can be passed. */
  readonly memberId: MemberId;
  /** The member's tier when the purchase was made. */
  readonly tier: LoyaltyTier;
  /** The purchase amount in minor units. */
  readonly amountMinor: number;
  /** ISO 4217 currency of the amount, so a hook can refuse to scale a currency it does not know. */
  readonly currency: string;
}
