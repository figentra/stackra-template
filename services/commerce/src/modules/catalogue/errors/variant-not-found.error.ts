/**
 * Stackra file contract:
 * Purpose: the refusal when no active product has a variant with the scanned barcode.
 * Boundary: a refusal class: kind `NotFound`, code derived from the class name
 *           (`variant_not_found`). It never reveals whether the barcode belongs to an archived
 *           product.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0232
 */
import { ErrorKind, Refusal } from "@stackra/errors";

/** Not retryable: scanning the same code again finds the same nothing. */
export class VariantNotFoundError extends Refusal({
  kind: ErrorKind.NotFound,
  retryable: false,
}) {
  /** The digits the scanner delivered. */
  barcode!: string;
}
