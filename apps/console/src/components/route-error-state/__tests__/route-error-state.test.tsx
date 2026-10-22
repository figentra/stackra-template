/**
 * Stackra file contract:
 * Purpose: proves a loader's 404 renders the not-found error state without a retry, and any other
 *          route error renders the generic state with a retry, in English and Arabic.
 * Boundary: unit tier, jsdom; `renderErrorBoundary` throws the given error inside a route under the
 *           testing providers.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0140
 */
import { describe, expect, it } from "@stackra/testing";
import { renderErrorBoundary, screen } from "@stackra/testing/react";
import { data } from "@stackra/navigation";
import { RouteErrorState } from "#src/components/route-error-state";

/** Guards the boundary every shell and public route falls back to. */
describe(RouteErrorState, () => {
  /** Retrying a missing page cannot help, so the not-found state offers no retry. */
  it("renders a 404 as not found, without a retry", () => {
    renderErrorBoundary(RouteErrorState, {
      route: "/orders/orders/nope",
      locale: "en",
      error: data({ code: "order_not_found" }, { status: 404 }),
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Page not found");
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  /** An unexpected failure keeps its details off the screen and offers a retry, in Arabic too. */
  it("renders any other error generically with a retry, in Arabic", () => {
    renderErrorBoundary(RouteErrorState, {
      route: "/settings",
      locale: "ar",
      error: new TypeError("x is undefined"),
    });
    expect(screen.getByRole("alert")).not.toHaveTextContent("x is undefined");
    expect(screen.getByRole("button", { name: "حاول مجددًا" })).toBeTruthy();
  });
});
