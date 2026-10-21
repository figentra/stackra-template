/**
 * Stackra file contract:
 * Purpose: the refusal when the actor has no inbox entry with the given id.
 * Boundary: a typed AppError; another principal's entry is the same refusal, so its existence never
 *           leaks (ADR 0140).
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232, guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `not_found` / `notification_not_found`; not retryable. */
export class NotificationNotFoundError extends AppError {
  /** Builds the refusal for the id the caller asked for. */
  constructor(notificationId: string) {
    super({
      category: ErrorCategory.NotFound,
      code: "notification_not_found",
      retryable: false,
      details: { notificationId },
    });
  }
}
