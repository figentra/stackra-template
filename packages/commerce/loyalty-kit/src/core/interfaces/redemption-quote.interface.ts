/**
 * Stackra file contract:
 * Purpose: the answer to "how much is a redemption worth right now".
 * Boundary: a read-only DTO returned by LoyaltyService.quote; nothing is held when it is produced.
 * Runtime: isomorphic
 * Governing contract: ADR 0220 (integer minor units)
 */

/** A capped redemption offer. */
export interface RedemptionQuote {
  /** Points that would be debited; may be lower than requested (balance, percentage cap). */
  readonly points: number;
  /** The discount those points buy, in minor units of the order currency. */
  readonly amountMinor: number;
}
