/**
 * Stackra file contract:
 * Purpose: the refusal when a non-enrolled principal tries to redeem.
 * Boundary: a refusal class: kind `Forbidden`, because the principal is authenticated but has no
 *           account (`NotFound` would leak nothing more); code derived from the class name
 *           (`not_a_member`). The text is `loyalty_kit::errors.not_a_member.message`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140, ADR 0232
 */
import { ErrorKind, Refusal } from "@stackra/errors";

/** Not retryable until the principal enrolls. */
export class NotAMemberError extends Refusal({
  kind: ErrorKind.Forbidden,
  retryable: false,
}) {
  /** The principal's public id, never a name or an email. */
  principalId!: string;
}
