/**
 * Stackra file contract:
 * Purpose: the refusal when an account is frozen for review and a caller tries to move its points.
 * Boundary: `Conflict`: the request is well formed, the account's state forbids it.
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232 (AppError)
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/**
 * `Conflict` / `account_frozen`; clears once staff unfreeze the account, so `retryable` is false
 * for the client.
 */
export class AccountFrozenError extends AppError {
  constructor(accountId: string) {
    super({
      category: ErrorCategory.Conflict,
      code: "account_frozen",
      retryable: false,
      details: { accountId },
    });
  }
}
