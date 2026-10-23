/**
 * Stackra file contract:
 * Purpose: the grid shows at most `limit` products from the bound query's page.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { ProductGrid } from "#src/blocks/product-grid/product-grid";

/** One storefront product as the listing query returns it. */
const product = (n: number) => ({
  id: `prd_01JA000000000000000000000${n}`,
  title: `Demo ${n}`,
  slug: `demo-${n}`,
  priceMinor: 12_000,
  currency: "SAR",
  image: { url: `https://cdn.test/${n}.jpg`, alt: "" },
  inStock: true,
});

/** Guards the product grid of the store page and the `web.product_grid` block. */
describe(ProductGrid, () => {
  /** The block's own cap wins over a longer page from the query. */
  it("caps the cards at the limit", () => {
    const data = { items: [product(1), product(2), product(3)], hasMore: false };
    render(<ProductGrid data={data} limit={2} />, { locale: "en" });
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
