/**
 * Stackra file contract:
 * Purpose: the refusal when no product with the given id or slug is visible to the caller.
 * Boundary: a refusal class: kind `NotFound` (HTTP 404 through the generated adapter), the code is
 *           derived from the class name (`product_not_found`) and the fields are the envelope's
 *           details. A draft or archived slug is the same refusal to the public, so the state
 *           never leaks.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0232
 */
import type { PublicId } from "@stackra/contracts";
import { ErrorKind, Refusal } from "@stackra/errors";

/** Built with whichever reference the caller looked up by; not retryable. */
export class ProductNotFoundError extends Refusal({
  kind: ErrorKind.NotFound,
  retryable: false,
}) {
  /** The public id the caller asked for, when the lookup was by id. */
  id?: PublicId<"prd">;

  /** The slug the caller asked for, when the lookup was by slug. */
  slug?: string;
}
