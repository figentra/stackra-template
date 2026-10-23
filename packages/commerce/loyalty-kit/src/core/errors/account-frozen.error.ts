/**
 * Stackra file contract:
 * Purpose: the refusal when an account is frozen for review and a caller tries to move its points.
 * Boundary: a refusal class: kind `Conflict` (the request is well formed, the account's state
 *           forbids it), code derived from the class name (`account_frozen`), the field is the
 *           envelope's detail. Built with `AccountFrozenError.create`; the text is
 *           `loyalty_kit::errors.account_frozen.message`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0232
 */
import type { PublicId } from "@stackra/contracts";
import { ErrorKind, Refusal } from "@stackra/errors";

/** Not retryable for the client: it clears only once staff unfreeze the account. */
export class AccountFrozenError extends Refusal({
  kind: ErrorKind.Conflict,
  retryable: false,
}) {
  /** The frozen account. */
  accountId!: PublicId<"lac">;
}
