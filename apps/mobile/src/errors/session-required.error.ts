/**
 * Stackra file contract:
 * Purpose: the refusal a signed-in hook raises when a route mounted it without a session: a
 *          programming error the generated tree should make impossible, surfaced loudly instead of
 *          rendering half a page.
 * Boundary: a typed `AppError` subclass (category plus snake_case code); its message is the typed
 *           key `I18n.mobile.refusals.session_required`, so gen finds the lang key for the code.
 * Runtime: react-native
 * Governing contract: ADR 0140, ADR 0232
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** Thrown by `useRequireSession` under a route that declares `auth: false`. */
export class SessionRequiredError extends AppError {
  /** The session precondition failed; retrying cannot help. */
  readonly category = ErrorCategory.FailedPrecondition;
  /** The wire code; its lang key is `mobile::refusals.session_required`. */
  readonly code = "session_required";
  /** A programming error, so never retried. */
  readonly retryable = false;
}
