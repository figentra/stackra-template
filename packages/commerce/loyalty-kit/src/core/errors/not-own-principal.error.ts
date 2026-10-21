/**
 * Stackra file contract:
 * Purpose: the refusal when a customer tries to enroll a principal other than themselves.
 * Boundary: `PermissionDenied`: the caller is authenticated but may only act for their own
 *           principal. One class per code, so the code has a lang key and a generated refusal ref
 *           like every other kit refusal.
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232 (AppError)
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `PermissionDenied` / `not_own_principal`. */
export class NotOwnPrincipalError extends AppError {
  constructor() {
    super({
      category: ErrorCategory.PermissionDenied,
      code: "not_own_principal",
      retryable: false,
    });
  }
}
