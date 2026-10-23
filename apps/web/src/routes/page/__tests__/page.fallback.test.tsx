/**
 * Stackra file contract:
 * Purpose: proves the server-rendered stand-in of a tenant page shows the page's title as its one
 *          `<h1>` and marks the region busy until the document renders.
 * Boundary: unit tier, jsdom; the component renders with PageRoute's loader data.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0114
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { PageFallback } from "#src/routes/page/page.fallback";

/** A published page as the loader returns it. */
const PAGE = { key: "about", seo: { title: "About us" }, root: { type: "web.cta_banner" } };

/** Guards the first paint of every tenant page, which is also its LCP text. */
describe(PageFallback, () => {
  /** Crawlers and screen readers get the title before hydration. */
  it("shows the title as the heading of a busy region", () => {
    render(<PageFallback data={{ page: PAGE }} />, { locale: "en" });
    const heading = screen.getByRole("heading", { level: 1, name: "About us" });
    expect(heading.closest("[aria-busy='true']")).toBeTruthy();
  });
});
