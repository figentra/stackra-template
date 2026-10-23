/**
 * Stackra file contract:
 * Purpose: proves the public product read returns the storefront projection (price from the faked
 *          pricing client, stock from inventory) and hides a draft slug.
 * Boundary: unit tier through the pipeline, memory drivers, factories for the product, its variants
 *           and their stock, a fake pricing client in the one typed form (ADR 0269).
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0082 (public area), ADR 0269, ADR 0022
 */
import assert from "node:assert/strict";
import { run } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { PricingClient } from "#stackra/clients/pricing";
import { CommerceModule } from "#stackra/module";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/database/factories/variant.factory";
import { ProductNotFoundError } from "#modules/catalogue/errors/product-not-found.error";
import { GetProductBySlugQuery } from "#modules/catalogue/queries/get-product-by-slug.query";
import { StockLevelFactory } from "#modules/inventory/database/factories/stock-level.factory";

/** Every quoted line costs 4 500 minor units of SAR. */
const pricing = fakeClient(PricingClient, (fake) =>
  fake.price.quote.returns(({ lines }) => ({
    currency: "SAR",
    lines: lines.map((line) => ({ ...line, unitPriceMinor: 4_500 })),
  })),
);

/** A booted service with the fake pricing client. */
const boot = () =>
  createTestingModule(CommerceModule)
    .useDrivers("memory")
    .override(PricingClient, pricing)
    .compile();

/** Anonymous storefront read of an active product with one variant in stock and one sold out. */
describe(GetProductBySlugQuery, () => {
  /** Price and currency come from the quote, `inStock` per variant from inventory. */
  it("returns the storefront projection for an active slug", async () => {
    await boot();
    const product = await ProductFactory.new().has(VariantFactory.new().count(2)).create();
    const [first, second] = product.variants;
    assert(first && second, "the factory made two variants");
    await StockLevelFactory.new().create({ variantId: first.id });
    await StockLevelFactory.new().soldOut().create({ variantId: second.id });

    const { output } = await run(
      GetProductBySlugQuery,
      { slug: product.slug },
      { as: actors.anonymous() },
    );

    expect(output).toMatchObject({ slug: product.slug, currency: "SAR", inStock: true });
    expect(output.variants.map((variant) => variant.priceMinor)).toEqual([4_500, 4_500]);
    expect(output.variants.map((variant) => variant.inStock)).toEqual([true, false]);
  });

  /** A draft product is a `product_not_found` to the public, never a "draft" state leak. */
  it("refuses a draft slug as not found", async () => {
    await boot();
    const draft = await ProductFactory.new().draft().create();

    const result = await run(
      GetProductBySlugQuery,
      { slug: draft.slug },
      { as: actors.anonymous() },
    );

    expect(result).toRefuseWith(refusal(ProductNotFoundError));
  });
});
