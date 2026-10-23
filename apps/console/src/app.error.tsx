/**
 * Stackra file contract:
 * Purpose: the console's root error boundary: a loader or render error under either layout becomes
 *          the same `ErrorState`, with a retry that revalidates the route; a loader's 404 renders
 *          as not found.
 * Boundary: the only place the console reads the route error, through `useRouteErrorInfo` from
 *           `@stackra/navigation/react`. Errors bubble from a route to its layout, then here; both
 *           layouts use this one boundary. It renders and never logs: reporting is the error
 *           state's (once, after commit), and a 404 is never reported.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14: `app.error.tsx`), ADR 0165 (React Router 7), ADR 0140
 */
import { ErrorKind } from "@stackra/errors";
import { useRevalidator, useRouteErrorInfo } from "@stackra/navigation/react";
import { ErrorState } from "#src/components/error-state";

/** Route-level error boundary of the whole console. */
export function AppErrorBoundary() {
  const { status, error } = useRouteErrorInfo();
  const { revalidate } = useRevalidator();
  return (
    <ErrorState
      error={error}
      {...(status === 404 ? { kind: ErrorKind.NotFound } : {})}
      onRetry={() => revalidate()}
    />
  );
}
