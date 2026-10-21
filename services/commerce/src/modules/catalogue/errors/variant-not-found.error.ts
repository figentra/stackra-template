/**
 * Stackra file contract:
 * Purpose: the refusal when no active product has a variant with the scanned barcode.
 * Boundary: a typed AppError; never reveals whether the barcode exists on an archived product (ADR
 *           0140).
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232, guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `not_found` / `variant_not_found`. */
export class VariantNotFoundError extends AppError {
  constructor(barcode: string) {
    super({
      category: ErrorCategory.NotFound,
      code: "variant_not_found",
      retryable: false,
      details: { barcode },
    });
  }
}
