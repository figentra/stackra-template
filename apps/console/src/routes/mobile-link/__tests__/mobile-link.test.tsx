/**
 * Stackra file contract:
 * Purpose: proves the mobile-link notice names the link it could not open, renders it as text, and
 *          offers the dashboard, in English and Arabic.
 * Boundary: unit tier, jsdom; the page is rendered with the loader's data.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { MobileLink } from "#src/routes/mobile-link/mobile-link";

/** Guards the page a mobile link with no console counterpart lands on. */
describe(MobileLink, () => {
  /** The visitor learns why and still has a way on; the link is shown, never followed. */
  it("names the link and links to the dashboard", () => {
    render(<MobileLink data={{ path: "/m/inbox" }} />, { locale: "en" });
    expect(screen.getByRole("heading", { level: 1, name: "Open in the Acme app" })).toBeTruthy();
    expect(screen.getByText("/m/inbox").closest("p")?.textContent).toBe("Link: /m/inbox");
    const dashboard = screen.getByRole("link", { name: "Go to the dashboard" });
    expect(dashboard.getAttribute("href")).toBe("/");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  /** Arabic gets the same notice and keeps the link's own direction. */
  it("shows the notice in Arabic", () => {
    render(<MobileLink data={{ path: "/m/announcements" }} />, { locale: "ar" });
    expect(screen.getByRole("link", { name: "الانتقال إلى لوحة المعلومات" })).toBeTruthy();
    expect(screen.getByText("/m/announcements").getAttribute("dir")).toBe("ltr");
  });
});
