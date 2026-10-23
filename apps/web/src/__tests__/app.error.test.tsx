/**
 * Stackra file contract:
 * Purpose: a 404 shows the not-found page with a localised home link; any other error shows the
 *          reference.
 * Boundary: unit tier, jsdom; `renderErrorBoundary` throws the given error inside a route under the
 *           testing providers.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0140
 */
import { describe, expect, it } from "@stackra/testing";
import { renderErrorBoundary, screen } from "@stackra/testing/react";
import { data } from "@stackra/navigation";
import { AppErrorBoundary } from "#src/app.error";

/** Guards the error boundary that visitors see when any route fails. */
describe(AppErrorBoundary, () => {
  /** A 404 must offer a way home within the visitor's own locale. */
  it("renders the not-found page for a 404 with a localised home link", () => {
    renderErrorBoundary(AppErrorBoundary, {
      route: "/ar/nope",
      locale: "ar",
      error: data({ code: "page_not_found" }, { status: 404 }),
    });
    expect(screen.getByRole("heading", { name: "الصفحة غير موجودة" })).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/ar");
  });

  /** Support needs the envelope reference shown so a reported failure can be traced. */
  it("renders the error page with the envelope's reference", () => {
    renderErrorBoundary(AppErrorBoundary, {
      route: "/store",
      locale: "en",
      error: data({ errorId: "err_1" }, { status: 500 }),
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Reference: err_1");
  });
});
