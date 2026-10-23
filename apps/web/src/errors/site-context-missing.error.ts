/**
 * Stackra file contract:
 * Purpose: the refusal `useSite` raises when a component renders outside the site layout, which is
 *          a programming error, not a visitor's mistake.
 * Boundary: a refusal with no details: the code is derived (`site_context_missing`), its text is
 *           the derived key `web::errors.site_context_missing.message`, and it is built with
 *           `SiteContextMissingError.create()`, never `new`. It never reaches a visitor, because
 *           the root boundary `@stackra/navigation` owns renders the generic error page.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (error envelope), ADR 0232
 */
import { ErrorKind, Refusal } from "@stackra/errors";

/** `useSite()` was called where no `SiteLayout` resolved a site; never retried. */
export class SiteContextMissingError extends Refusal({
  kind: ErrorKind.FailedPrecondition,
  retryable: false,
}) {}
