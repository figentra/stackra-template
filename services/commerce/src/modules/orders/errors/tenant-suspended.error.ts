/**
 * Stackra file contract:
 * Purpose: the refusal when a suspended tenant tries to write; thrown by TenantActiveGuard.
 * Boundary: a typed AppError subclass (ADR 0128): one category, one snake_case code; the HTTP
 *           status is derived from the category by the generated adapter and never written here.
 * Runtime: isomorphic
 * Governing contract: ADR 0140 (envelope), ADR 0232 (every error extends AppError),
 *                     guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `failed_precondition` / `tenant_suspended`; not retryable until the tenant is reinstated. */
export class TenantSuspendedError extends AppError {
  /** The category every caller branches on. */
  readonly category = ErrorCategory.FailedPrecondition;
  /** The code the console maps to `orders::refusals.tenant_suspended`. */
  readonly code = "tenant_suspended";
  /** Waiting does not help; the tenant must be reinstated first. */
  readonly retryable = false;
}
