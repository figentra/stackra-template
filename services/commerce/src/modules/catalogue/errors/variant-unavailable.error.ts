/**
 * Stackra file contract:
 * Purpose: the refusal when a cart names a variant that is missing or whose product is not on sale.
 * Boundary: a refusal class: kind `FailedPrecondition` (category `precondition_failed`), code
 *           derived from the class name (`variant_unavailable`). It lists every offending id, so a
 *           stale cart is fixed in one round trip.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0232
 */
import type { PublicId } from "@stackra/contracts";
import { ErrorKind, Refusal } from "@stackra/errors";

/** Raised by ProductService#assertSellable before orders prices anything; not retryable. */
export class VariantUnavailableError extends Refusal({
  kind: ErrorKind.FailedPrecondition,
  retryable: false,
}) {
  /** Every requested variant that is missing or belongs to a product that is not active. */
  variantIds!: PublicId<"var">[];
}
