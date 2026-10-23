/**
 * Stackra file contract:
 * Purpose: proves the not-found page says so in the user's language and links home to the dashboard
 *          route.
 * Boundary: unit tier, jsdom; the page renders inside the testing router.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0140
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { NotFound } from "#src/routes/not-found/not-found";

/** Guards the page a mistyped or stale link lands on. */
describe(NotFound, () => {
  /** A dead end in Arabic still offers the way home. */
  it("offers the way home, in Arabic", () => {
    render(<NotFound />, { locale: "ar", route: "/nope" });
    expect(screen.getByText("الصفحة غير موجودة")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/");
  });
});
