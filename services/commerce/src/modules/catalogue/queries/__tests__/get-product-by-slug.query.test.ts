/**
 * Stackra file contract:
 * Purpose: proves the public product read returns the storefront projection (price from the faked
 *          pricing client, stock from inventory) and hides a draft slug.
 * Boundary: unit tier through the pipeline, memory drivers, factories for the product, its variants
 *           and their stock, a fake pricing client in the one typed form (ADR 0269).
 * Runtime: node
 * Governing contract: ADR 0098, 0082, ADR 0022, guides/programming-model.mdx#tests, ADR 0269
 */
import assert from "node:assert/strict";
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { refusal } from "@stackra/errors/testing";
import { fakeClient } from "@stackra/clients/testing";
import { PricingClient } from "#stackra/clients";
import { Refusals } from "#stackra/manifest";
import { CommerceModule } from "#src/commerce.module";
import { GetProductBySlugQuery } from "#modules/catalogue/queries/get-product-by-slug.query";
import { ProductFactory } from "#modules/catalogue/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/factories/variant.factory";
import { StockLevelFactory } from "#modules/inventory/factories/stock-level.factory";

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

/** Anonymous storefront read of an Active product with one variant in stock and one sold out. */
describe(GetProductBySlugQuery, () => {
  /** Price and currency come from the quote, `inStock` per variant from inventory. */
  it("returns the storefront projection for an active slug", async () => {
    const app = await boot();
    const product = await new ProductFactory(app.em).has(VariantFactory, 2).createOne();
    const [first, second] = product.variants;
    assert(first && second, "the factory made two variants");
    await new StockLevelFactory(app.em).createOne({ variantId: first.id });
    await new StockLevelFactory(app.em).state("soldOut").createOne({ variantId: second.id });

    const { output } = await run(
      GetProductBySlugQuery,
      { slug: product.slug },
      { as: actors.anonymous() },
    );

    expect(output).toMatchObject({ slug: product.slug, currency: "SAR", inStock: true });
    expect(output.variants.map((v) => v.priceMinor)).toEqual([4_500, 4_500]);
    expect(output.variants.map((v) => v.inStock)).toEqual([true, false]);
  });

  /** A draft product is a `product_not_found` to the public, never a "draft" state leak. */
  it("refuses a draft slug as not found", async () => {
    const app = await boot();
    const draft = await new ProductFactory(app.em).state("draft").createOne();

    const result = await run(
      GetProductBySlugQuery,
      { slug: draft.slug },
      { as: actors.anonymous() },
    );

    expect(result).toRefuseWith(refusal(Refusals.catalogue.product_not_found));
  });
});
