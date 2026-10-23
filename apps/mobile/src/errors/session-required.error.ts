/**
 * Stackra file contract:
 * Purpose: the refusal a signed-in hook raises when a route mounted it without a session: a
 *          programming error the generated tree should make impossible, surfaced loudly instead of
 *          rendering half a page.
 * Boundary: a refusal with no details: the code is derived (`session_required`), its text is the
 *           derived key `mobile::errors.session_required.message`, and it is built with
 *           `SessionRequiredError.create()`, never `new`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140, ADR 0232
 */
import { ErrorKind, Refusal } from "@stackra/errors";

/** Thrown by `useProfile` when a page that needs a session renders signed out; never retried. */
export class SessionRequiredError extends Refusal({
  kind: ErrorKind.FailedPrecondition,
  retryable: false,
}) {}
