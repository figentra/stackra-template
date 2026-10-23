/**
 * Stackra file contract:
 * Purpose: the refusal when a customer tries to enroll a principal other than themselves.
 * Boundary: a refusal class: kind `Forbidden` (the caller is authenticated but may act only for
 *           their own principal), code derived from the class name (`not_own_principal`). It
 *           carries no details. The text is `loyalty_kit::errors.not_own_principal.message`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140, ADR 0232
 */
import { ErrorKind, Refusal } from "@stackra/errors";

/** Built with `NotOwnPrincipalError.create()`. */
export class NotOwnPrincipalError extends Refusal({
  kind: ErrorKind.Forbidden,
  retryable: false,
}) {}
