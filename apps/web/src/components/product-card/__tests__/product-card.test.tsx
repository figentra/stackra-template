/**
 * Stackra file contract:
 * Purpose: the price is formatted for the currency and locale, the link is localised, and the image
 *          asks for a sized variant.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080, ADR 0222
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { Locale } from "@stackra/i18n";
import { ProductCard } from "#src/components/product-card";

/** The seeded demo product as the storefront listing returns it. */
const product = {
  id: "prd_01JA0000000000000000000001",
  title: "Demo tee",
  slug: "demo-tee",
  priceMinor: 12_000,
  currency: "SAR",
  image: { url: "https://cdn.test/tee.jpg", alt: "" },
  inStock: true,
};

/** Guards the storefront listing card, the main path into a product page. */
describe(ProductCard, () => {
  /**
   * Price formatting and link locale must match the visitor, or the store shows wrong currency or
   * pages.
   */
  it("formats the price and localises the link", () => {
    render(<ProductCard product={product} />, { locale: "ar", site: { locale: Locale.Ar } });
    expect(screen.getByRole("link", { name: "Demo tee" }).getAttribute("href")).toBe(
      "/ar/store/demo-tee",
    );
    expect(screen.getByText(/120\.00/)).toBeTruthy();
    expect(screen.getByText("متوفر")).toBeTruthy();
  });

  /** Right-sized, lazy images protect page weight and LCP on listing pages. */
  it("requests a 480px webp variant and lazy-loads below the fold", () => {
    const { container } = render(<ProductCard product={product} />, {
      locale: "en",
      site: { locale: Locale.En },
    });
    const img = container.querySelector("img")!;
    // the media fake's form
    expect(img.getAttribute("src")).toBe("https://cdn.test/tee.jpg?w=480&format=webp");
    expect(img.getAttribute("loading")).toBe("lazy");
  });
});
