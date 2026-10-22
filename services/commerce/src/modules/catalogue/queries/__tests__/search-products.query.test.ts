/**
 * Stackra file contract:
 * Purpose: proves the public product search returns priced storefront cards for Active products
 *          only, and an empty page when nothing matches.
 * Boundary: unit tier through the pipeline, memory drivers (the memory search driver indexes the
 *           declared fields), factories for products and variants, a fake pricing client in the one
 *           typed form (ADR 0269).
 * Runtime: node
 * Governing contract: ADR 0098, 0082, 0221, ADR 0022, ADR 0269
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { PricingClient } from "#stackra/clients";
import { CommerceModule } from "#src/commerce.module";
import { SearchProductsQuery } from "#modules/catalogue/queries/search-products.query";
import { ProductFactory } from "#modules/catalogue/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/factories/variant.factory";

/** Every quoted line costs 4 500 minor units of SAR. */
const pricing = fakeClient(PricingClient, (fake) =>
  fake.price.quote.returns(({ lines }) => ({
    currency: "SAR",
    lines: lines.map((l) => ({ ...l, unitPriceMinor: 4_500 })),
  })),
);

/** A booted service with the fake pricing client. */
const boot = () =>
  createTestingModule(CommerceModule)
    .useDrivers("memory")
    .override(PricingClient, pricing)
    .compile();

/** Anonymous storefront search. */
describe(SearchProductsQuery, () => {
  /** A matching Active product is a priced card; a matching draft never shows. */
  it("returns active matches as priced cards", async () => {
    const app = await boot();
    const active = await new ProductFactory(app.em)
      .has(VariantFactory, 1)
      .createOne({ title: { en: "Cardamom coffee", ar: "قهوة بالهيل" } });
    await new ProductFactory(app.em)
      .state("draft")
      .has(VariantFactory, 1)
      .createOne({ title: { en: "Cardamom tea", ar: "شاي بالهيل" } });

    const { output } = await run(
      SearchProductsQuery,
      { q: "cardamom", limit: 20 },
      { as: actors.anonymous() },
    );

    expect(output.items.map((c) => c.slug)).toEqual([active.slug]);
    expect(output.items[0]).toMatchObject({ priceMinor: 4_500, currency: "SAR" });
    expect(output.hasMore).toBe(false);
  });

  /** No match is an empty last page, never a refusal. */
  it("returns an empty page when nothing matches", async () => {
    const app = await boot();
    await new ProductFactory(app.em).has(VariantFactory, 1).createOne();

    const { output } = await run(
      SearchProductsQuery,
      { q: "zzzz-no-such-product", limit: 20 },
      { as: actors.anonymous() },
    );

    expect(output).toEqual({ items: [], hasMore: false });
  });
});
