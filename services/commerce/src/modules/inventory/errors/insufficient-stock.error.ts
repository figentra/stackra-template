/**
 * Stackra file contract:
 * Purpose: the refusal when a reservation asks for more than is available and backorders are off.
 * Boundary: a refusal class: kind `FailedPrecondition` (category `precondition_failed`), code
 *           derived from the class name (`insufficient_stock`). It names the first variant that
 *           cannot be covered.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0232
 */
import type { PublicId } from "@stackra/contracts";
import { ErrorKind, Refusal } from "@stackra/errors";
import { Int } from "@stackra/validation";

/** Raised by StockService#reserve before anything is held; not retryable. */
export class InsufficientStockError extends Refusal({
  kind: ErrorKind.FailedPrecondition,
  retryable: false,
}) {
  /** The first variant the reservation could not cover. */
  variantId!: PublicId<"var">;

  /** The units it had available when the reservation was refused. */
  @Int
  available!: number;
}
