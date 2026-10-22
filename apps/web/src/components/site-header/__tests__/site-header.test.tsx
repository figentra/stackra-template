/**
 * Stackra file contract:
 * Purpose: links from the menu land in the visitor's locale mount, and the scheme toggle sets
 *          `data-theme` on `<html>` and its pressed state.
 * Boundary: unit tier, jsdom, the @stackra/testing/react providers (router with both locale mounts,
 *           i18n, theming).
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080, ADR 0007
 */
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { SiteHeader } from "#src/components/site-header";

/** Guards the global navigation present on every public page. */
describe(SiteHeader, () => {
  /** A wrong prefix would send Arabic visitors to English pages or break default-locale URLs. */
  it("links to the visitor's locale mount", () => {
    render(<SiteHeader siteName="Acme" locale={Locale.Ar} />, { locale: "ar", route: "/ar" });
    expect(screen.getByRole("link", { name: "المتجر" }).getAttribute("href")).toBe("/ar/store");
    render(<SiteHeader siteName="Acme" locale={Locale.En} />, { locale: "en", route: "/" });
    expect(screen.getByRole("link", { name: "Store" }).getAttribute("href")).toBe("/store");
  });

  /** The scheme switch must update the document and its pressed state for assistive tech. */
  it("toggles the colour scheme on <html>", async () => {
    render(<SiteHeader siteName="Acme" locale={Locale.En} />, { locale: "en", route: "/" });
    const toggle = screen.getByRole("button", { name: "Colour scheme" });
    await userEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
