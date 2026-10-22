/**
 * Stackra file contract:
 * Purpose: proves the product loader turns the service's `product_not_found` refusal into a 404,
 *          and `meta` carries canonical, hreflang, the tenant's SEO override and Product JSON-LD
 *          with decimal prices in the market currency.
 * Boundary: unit tier; `runRouteLoader` and `routeMeta` call the class's methods with the adapter's
 *           arguments; the commerce client is faked.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0176, ADR 0220, ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { refusal } from "@stackra/errors/testing";
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { routeMeta, runRouteLoader } from "@stackra/testing/react";
import { Commerce } from "#stackra/clients";
import { ProductRoute } from "#src/routes/product.route";

/** The Arabic site of the cases. */
const SITE = {
  siteId: "site_1",
  name: "Acme",
  locale: Locale.Ar,
  dir: "rtl",
  market: { key: "sa", currency: "SAR" },
  indexable: true,
  origin: "https://www.example.com",
  signupUrl: "https://www.example.com/signup",
  brand: {},
} as const;
/** The seeded demo product as the storefront projection returns it. */
const PRODUCT = {
  id: "prd_01JA0000000000000000000001",
  title: "Demo tee",
  slug: "demo-tee",
  currency: "SAR",
  inStock: true,
  images: [{ url: "https://cdn.test/tee.jpg", alt: "" }],
  description: { type: "doc", children: [] },
  variants: [
    {
      id: "var_01JA0000000000000000000001",
      sku: "TEE-M",
      priceMinor: 12_000,
      inStock: true,
      options: { size: "M" },
    },
  ],
  seo: { title: "Demo tee | Acme", description: null, noindex: false },
  collections: [{ title: "Shirts", slug: "shirts" }],
};

/** Guards the product page loader and metadata, which drive SEO and sharing. */
describe(ProductRoute, () => {
  /** An unknown slug must be a real 404, not an empty product page. */
  it("throws 404 for an unknown slug", async () => {
    const commerce = fakeClient(Commerce, (fake) =>
      fake.queries.GetProductBySlug.throws(refusal(Commerce.refusals.product_not_found)),
    );
    const run = runRouteLoader(ProductRoute, {
      site: SITE,
      clients: [commerce],
      params: { slug: "nope" },
    });
    await expect(run).rejects.toMatchObject({ status: 404 });
  });

  /**
   * Canonical, alternates and JSON-LD must come from loader data or search listings would be wrong.
   */
  it("builds canonical, alternates and Product JSON-LD from the loader data", async () => {
    const commerce = fakeClient(Commerce, (fake) => fake.queries.GetProductBySlug.returns(PRODUCT));
    const params = { slug: "demo-tee" };
    const data = await runRouteLoader(ProductRoute, { site: SITE, clients: [commerce], params });
    const descriptors = routeMeta(ProductRoute, { data, site: SITE, path: "/ar/store/demo-tee" });

    expect(descriptors).toContainEqual({ title: "Demo tee | Acme" });
    expect(descriptors).toContainEqual({
      tagName: "link",
      rel: "canonical",
      href: "https://www.example.com/ar/store/demo-tee",
    });
    expect(descriptors).toContainEqual({
      tagName: "link",
      rel: "alternate",
      hrefLang: "en",
      href: "https://www.example.com/store/demo-tee",
    });
    const ld = descriptors.find(
      (d) => "script:ld+json" in d && d["script:ld+json"]["@type"] === "Product",
    ) as {
      "script:ld+json": { offers: { priceCurrency: string; lowPrice: string } };
    };
    expect(ld["script:ld+json"].offers).toMatchObject({ priceCurrency: "SAR", lowPrice: "120.00" });
  });
});
