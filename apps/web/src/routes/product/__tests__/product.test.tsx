/**
 * Stackra file contract:
 * Purpose: proves the product page links every breadcrumb to a page that exists (the store, the
 *          store filtered by collection), shows the chosen variant's stock and links the enquiry to
 *          the contact page with the product and the variant's SKU.
 * Boundary: unit tier, jsdom; the page renders with ProductRoute's loader data.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0135
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { Product } from "#src/routes/product/product";

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
describe(Product, () => {
  /** A crumb that 404s is a dead end; each one opens the store, filtered where it names one. */
  it("links the breadcrumbs to the store and the filtered store", () => {
    render(<Product data={{ product: PRODUCT }} />, { locale: "en", route: "/store/demo-tee" });
    const trail = screen.getByRole("navigation", { name: "Breadcrumb" });
    const links = trail.querySelectorAll("a");
    expect([...links].map((link) => link.getAttribute("href"))).toEqual([
      "/store",
      "/store?collection=shirts",
    ]);
  });

  /** The storefront sells nothing anonymously; the enquiry names the exact variant asked about. */
  it("links the enquiry to the contact page with the product and the variant's SKU", () => {
    render(<Product data={{ product: PRODUCT }} />, { locale: "en", route: "/store/demo-tee" });
    expect(screen.getByText("Out of stock")).toBeTruthy();
    const enquiry = screen.getByRole("link", { name: "Ask about this product" });
    const target = new URL(enquiry.getAttribute("href") ?? "", "https://acme.example");
    expect(target.pathname).toBe("/contact");
    expect(Object.fromEntries(target.searchParams)).toEqual({ product: "Demo tee", sku: "TEE-M" });
  });

  /** The Arabic page offers the same enquiry in Arabic, to the Arabic contact page. */
  it("offers the enquiry in Arabic under the Arabic mount", () => {
    render(<Product data={{ product: PRODUCT }} />, { locale: "ar", route: "/ar/store/demo-tee" });
    const enquiry = screen.getByRole("link", { name: "اسأل عن هذا المنتج" });
    expect(enquiry.getAttribute("href")).toMatch(/^\/ar\/contact\?/);
  });
});
