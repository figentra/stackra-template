/**
 * Stackra file contract:
 * Purpose: the refusal when a cart names a variant that is missing or whose product is not on sale.
 * Boundary: a typed AppError; lists every offending id so a stale cart is fixed in one round trip.
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232, guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `failed_precondition` / `variant_unavailable`; not retryable. */
export class VariantUnavailableError extends AppError {
  constructor(variantIds: readonly string[]) {
    super({
      category: ErrorCategory.FailedPrecondition,
      code: "variant_unavailable",
      retryable: false,
      details: { variantIds: [...variantIds] },
    });
  }
}
