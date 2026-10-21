/**
 * Stackra file contract:
 * Purpose: the refusal when a member asks for more points than they hold.
 * Boundary: a typed AppError with one category and one snake_case code; the transport mapping (412
 *           here) is generated from the category, never written here. `details` carries numbers
 *           only, never personal data.
 * Runtime: isomorphic
 * Governing contract: ADR 0140 (envelope, categories), ADR 0232 (every error extends AppError), ADR
 *                     0231 (codes)
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/**
 * `FailedPrecondition` / `insufficient_points`; shown to the member as
 * `loyalty_kit::refusals.insufficient_points`.
 */
export class InsufficientPointsError extends AppError {
  /**
   * @param balance - points the member holds now.
   * @param requested - points the caller asked for.
   */
  constructor(balance: number, requested: number) {
    super({
      category: ErrorCategory.FailedPrecondition,
      code: "insufficient_points",
      retryable: false,
      details: { balance, requested },
    });
  }
}
