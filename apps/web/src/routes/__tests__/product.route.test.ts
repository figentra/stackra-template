/**
 * Stackra file contract:
 * Purpose: proves the product loader turns the service's `product_not_found` refusal into a 404,
 *          and the head carries canonical, hreflang, the tenant's SEO override, Product JSON-LD
 *          with decimal prices in the market currency, and breadcrumbs that land on real pages (the
 *          store, the store filtered by collection, the product) in the visitor's locale.
 * Boundary: unit tier; `runRouteLoader` and `routeMeta` call the class's methods with the adapter's
 *           arguments and its SEO default chain; the commerce client is faked.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0220, ADR 0007
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
  origin: "https://www.acme.example",
  signupUrl: "https://www.acme.example/signup",
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
      href: "https://www.acme.example/ar/store/demo-tee",
    });
    expect(descriptors).toContainEqual({
      tagName: "link",
      rel: "alternate",
      hrefLang: "en",
      href: "https://www.acme.example/store/demo-tee",
    });
    const ld = descriptors.find(
      (d) => "script:ld+json" in d && d["script:ld+json"]["@type"] === "Product",
    ) as {
      "script:ld+json": { offers: { priceCurrency: string; lowPrice: string } };
    };
    expect(ld["script:ld+json"].offers).toMatchObject({ priceCurrency: "SAR", lowPrice: "120.00" });
  });

  /** A crumb that 404s teaches crawlers a broken trail; each must open a page that exists. */
  it("links the breadcrumbs to the store, the filtered store and the product", async () => {
    const commerce = fakeClient(Commerce, (fake) => fake.queries.GetProductBySlug.returns(PRODUCT));
    const params = { slug: "demo-tee" };
    const data = await runRouteLoader(ProductRoute, { site: SITE, clients: [commerce], params });
    const descriptors = routeMeta(ProductRoute, { data, site: SITE, path: "/ar/store/demo-tee" });
    const trail = descriptors.find(
      (d) => "script:ld+json" in d && d["script:ld+json"]["@type"] === "BreadcrumbList",
    ) as { "script:ld+json": { itemListElement: { item: string }[] } };

    expect(trail["script:ld+json"].itemListElement.map((crumb) => crumb.item)).toEqual([
      "https://www.acme.example/ar/store",
      "https://www.acme.example/ar/store?collection=shirts",
      "https://www.acme.example/ar/store/demo-tee",
    ]);
  });
});
