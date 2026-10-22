/**
 * Stackra file contract:
 * Purpose: what a host hands `AccountService.earn`: the purchase amount and the reference the
 *          credit is idempotent on.
 * Boundary: a plain DTO; the member is a separate argument, and the tier and hooks are the kit's
 *           business.
 * Runtime: isomorphic
 * Governing contract: ADR 0220 (integer minor units), ADR 0128 decision 4 (interfaces/ kind folder)
 */

/** One purchase to credit. */
export interface EarnRequest {
  /** The purchase amount in minor units of `currency`. */
  readonly amountMinor: number;
  /** ISO 4217 currency of the amount. */
  readonly currency: string;
  /** What caused the credit (an order id); a repeated reference credits nothing twice. */
  readonly reference: string;
}
