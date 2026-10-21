/**
 * Stackra file contract:
 * Purpose: the refusal when no product with the given id or slug is visible to the caller.
 * Boundary: a typed AppError subclass; a draft or archived slug is the same refusal to the public,
 *           so the state never leaks (ADR 0140).
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232, guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `not_found` / `product_not_found`; not retryable. */
export class ProductNotFoundError extends AppError {
  /** Builds the refusal with whichever reference the caller looked up by. */
  constructor(reference: { readonly id: string } | { readonly slug: string }) {
    super({
      category: ErrorCategory.NotFound,
      code: "product_not_found",
      retryable: false,
      details: reference,
    });
  }
}
