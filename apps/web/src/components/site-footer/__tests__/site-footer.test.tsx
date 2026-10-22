/**
 * Stackra file contract:
 * Purpose: proves the footer draws the legal links from `FooterMenu` in the visitor's locale mount
 *          and names the site in the rights line.
 * Boundary: unit tier, jsdom; the menu is the real class, rendered by the navigation package.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0114
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { SiteFooter } from "#src/components/site-footer";

/** Guards the legal links every page must carry. */
describe(SiteFooter, () => {
  /** An Arabic visitor reads the Arabic privacy page, not the English one. */
  it("links the legal pages in the Arabic mount", () => {
    render(<SiteFooter siteName="Acme" />, { locale: "ar", route: "/ar" });
    const legal = screen.getByRole("navigation", { name: "الشؤون القانونية" });
    expect(legal.querySelector("a[href='/ar/privacy']")).toHaveTextContent("الخصوصية");
    expect(legal.querySelector("a[href='/ar/terms']")).toHaveTextContent("الشروط");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Acme");
  });
});
