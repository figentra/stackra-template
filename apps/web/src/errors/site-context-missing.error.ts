/**
 * Stackra file contract:
 * Purpose: the error `useSite` throws when a component renders outside the site layout, which is a
 *          programming error, not a visitor's mistake.
 * Boundary: a typed `AppError` subclass; it never reaches a visitor because the root error boundary
 *           renders the generic error page.
 * Runtime: isomorphic
 * Governing contract: ADR 0140 (error envelope), ADR 0232 (typed errors)
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `useSite()` was called where no `SiteLayout` resolved a site. */
export class SiteContextMissingError extends AppError {
  /** A precondition of the hook, not a missing record. */
  readonly category = ErrorCategory.PreconditionFailed;
  /** Stable code for the reporter. */
  readonly code = "site_context_missing";
}
