/**
 * Stackra file contract:
 * Purpose: the router's `errorElement`: turns a loader or render error into the same `ErrorState`,
 *          with a retry that revalidates the route.
 * Boundary: the only place the console reads the route error, through
 *           `@stackra/navigation/react`; a 404 response from a loader renders as `not_found`.
 *           Reporting is the error state's (once, after commit).
 * Runtime: browser
 * Governing contract: ADR 0165 (React Router 7), ADR 0140
 */
import { AppError, ErrorCategory } from "@stackra/errors";
import { useRevalidator, useRouteErrorInfo } from "@stackra/navigation/react";
import { ErrorState } from "#src/components/error-state";

/** Route-level error boundary; one per shell and one for the public login route. */
export function RouteErrorState() {
  const { status, error } = useRouteErrorInfo();
  const { revalidate } = useRevalidator();
  const normalised =
    status === 404
      ? new AppError({ category: ErrorCategory.NotFound, code: "route_not_found" })
      : error;
  return <ErrorState error={normalised} onRetry={() => revalidate()} />;
}
