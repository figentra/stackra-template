/**
 * Stackra file contract:
 * Purpose: the refusal when a non-enrolled principal tries to redeem.
 * Boundary: `Forbidden` because the principal is authenticated but has no account;
 *           `NotFound` would leak nothing more.
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232 (AppError)
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `Forbidden` / `not_a_member`. */
export class NotAMemberError extends AppError {
  /** @param principalId - public id, never a name or an email. */
  constructor(principalId: string) {
    super({
      category: ErrorCategory.Forbidden,
      code: "not_a_member",
      retryable: false,
      details: { principalId },
    });
  }
}
