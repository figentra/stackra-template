/**
 * Stackra file contract:
 * Purpose: proves the store page says so when nothing matches, and that "show more" keeps the
 *          search while it carries the next cursor.
 * Boundary: unit tier, jsdom; the page renders with StoreRoute's loader data and search.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0221
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { StorePage } from "#src/components/pages/store";

/** One card and a next page. */
const PAGE = {
  items: [
    {
      id: "prd_01JA0000000000000000000001",
      title: "Demo tee",
      slug: "demo-tee",
      priceMinor: 12_000,
      currency: "SAR",
      image: null,
      inStock: true,
    },
  ],
  nextCursor: "c_2",
  hasMore: true,
};

/** Guards the listing every shopper starts from. */
describe(StorePage, () => {
  /** An empty result is a status, so it is announced and not mistaken for a broken page. */
  it("announces an empty result", () => {
    const data = { page: { items: [], hasMore: false }, search: "zzz", noindex: true };
    render(<StorePage data={data} search={{ q: "zzz" }} />, { locale: "en", route: "/store" });
    expect(screen.getByRole("status")).toHaveTextContent("No products match");
  });

  /** A shared "next" link must reopen the same search one page further. */
  it("carries the search and the next cursor on show more", () => {
    const data = { page: PAGE, search: "tee", noindex: true };
    render(<StorePage data={data} search={{ q: "tee" }} />, { locale: "en", route: "/store" });
    const more = screen.getByRole("link", { name: "Show more" });
    expect(more.getAttribute("href")).toBe("/store?q=tee&cursor=c_2");
    expect(more.getAttribute("rel")).toBe("next");
  });
});
