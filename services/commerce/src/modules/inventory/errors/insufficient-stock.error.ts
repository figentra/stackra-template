/**
 * Stackra file contract:
 * Purpose: the refusal when a reservation asks for more than is available and backorders are off.
 * Boundary: a typed AppError naming the first variant that cannot be covered.
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232, guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `precondition_failed` / `insufficient_stock`; not retryable. */
export class InsufficientStockError extends AppError {
  constructor(variantId: string, available: number) {
    super({
      category: ErrorCategory.PreconditionFailed,
      code: "insufficient_stock",
      retryable: false,
      details: { variantId, available },
    });
  }
}
