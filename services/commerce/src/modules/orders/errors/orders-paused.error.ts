/**
 * Stackra file contract:
 * Purpose: the refusal when an order is placed while the tenant has paused ordering; thrown by
 *          AcceptingOrdersGuard.
 * Boundary: a typed AppError subclass: one category, one snake_case code; the HTTP status is
 *           derived from the category by the generated adapter and never written here.
 * Runtime: isomorphic
 * Governing contract: ADR 0140 (envelope), ADR 0232 (every error extends AppError),
 *                     guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `precondition_failed` / `orders_paused`; not retryable until the tenant resumes ordering. */
export class OrdersPausedError extends AppError {
  /** The category every caller branches on. */
  readonly category = ErrorCategory.PreconditionFailed;
  /** The code the clients map to `orders::refusals.orders_paused`. */
  readonly code = "orders_paused";
  /** Retrying does not help; a tenant admin must switch ordering back on first. */
  readonly retryable = false;
}
