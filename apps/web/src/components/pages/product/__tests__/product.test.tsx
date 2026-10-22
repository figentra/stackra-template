/**
 * Stackra file contract:
 * Purpose: proves the product page links every breadcrumb to a page that exists (the store, the
 *          store filtered by collection) and disables "Add to cart" for a variant out of stock.
 * Boundary: unit tier, jsdom; the page renders with ProductRoute's loader data.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0135
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { ProductPage } from "#src/components/pages/product";

/** A one-variant product out of stock, in one collection. */
const PRODUCT = {
  id: "prd_01JA0000000000000000000001",
  title: "Demo tee",
  slug: "demo-tee",
  currency: "SAR",
  inStock: false,
  images: [{ url: "https://cdn.acme.example/tee.jpg", alt: "A grey tee" }],
  description: { type: "doc", children: [] },
  variants: [
    {
      id: "var_01JA0000000000000000000001",
      sku: "TEE-M",
      priceMinor: 12_000,
      inStock: false,
      options: {},
    },
  ],
  seo: { title: null, description: null, noindex: false },
  collections: [{ title: "Shirts", slug: "shirts" }],
};

/** Guards the page a shopper decides on. */
describe(ProductPage, () => {
  /** A crumb that 404s is a dead end; each one opens the store, filtered where it names one. */
  it("links the breadcrumbs to the store and the filtered store", () => {
    render(<ProductPage data={{ product: PRODUCT }} />, { locale: "en", route: "/store/demo-tee" });
    const trail = screen.getByRole("navigation", { name: "Breadcrumb" });
    const links = trail.querySelectorAll("a");
    expect([...links].map((link) => link.getAttribute("href"))).toEqual([
      "/store",
      "/store?collection=shirts",
    ]);
  });

  /** Selling what is not there would fail at checkout; the button says so up front. */
  it("disables Add to cart while the chosen variant is out of stock", () => {
    render(<ProductPage data={{ product: PRODUCT }} />, { locale: "en", route: "/store/demo-tee" });
    expect(screen.getByText("Out of stock")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeDisabled();
  });
});
