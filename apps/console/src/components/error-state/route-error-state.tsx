/**
 * Stackra file contract:
 * Purpose: the router's `errorElement`: turns a loader or render error into the same `ErrorState`,
 *          with a retry that revalidates the route.
 * Boundary: the only place the console reads `useRouteError`; a 404 response from a loader renders
 *           as `not_found`.
 * Runtime: browser
 * Governing contract: ADR 0165 (React Router 7), ADR 0140
 */
import { isRouteErrorResponse, useRevalidator, useRouteError } from "react-router";
import { AppError, ErrorCategory } from "@stackra/errors";
import { ErrorState } from "./error-state";

/** Route-level error boundary; one per shell and one for the public login route. */
export function RouteErrorState() {
  const error = useRouteError();
  const { revalidate } = useRevalidator();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const normalised = notFound
    ? new AppError({ category: ErrorCategory.NotFound, code: "route_not_found" })
    : error;
  return <ErrorState error={normalised} onRetry={() => revalidate()} />;
}
