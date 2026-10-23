/**
 * Stackra file contract:
 * Purpose: proves archive is idempotent (one event, however often it is called), permission-gated,
 *          and forgets the cached view.
 * Boundary: unit tier through the real pipeline (`run`) with memory drivers; the cache driver is
 *           memory too, so the forgotten entry is observable. Ids come from the factory.
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0136, ADR 0137, ADR 0022
 */
import assert from "node:assert/strict";
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { ForbiddenError } from "@stackra/errors";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { CommerceModule } from "#stackra/module";
import { ArchiveProductAction } from "#modules/catalogue/actions/archive-product.action";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/database/factories/variant.factory";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { ProductArchived } from "#modules/catalogue/events/product-archived.event";
import { GetProductQuery } from "#modules/catalogue/queries/get-product.query";

/** One active product with one variant, built fresh per test, and a staff actor. */
async function setup() {
  const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
  const product = await ProductFactory.new().has(VariantFactory.new()).create();
  const [variant] = product.variants;
  assert(variant, "the factory made one variant");
  return { app, productId: product.id, variantId: variant.id, staff: actors.staff() };
}

/** Guards product archiving, which pulls a product off sale and must stay consistent. */
describe(ArchiveProductAction, () => {
  /**
   * The second call must find no allowed transition and record nothing; the outbox sees one event.
   */
  it("archives once and records once, then repeats silently", async () => {
    const { app, productId, variantId, staff } = await setup();

    const first = await run(ArchiveProductAction, { productId }, { as: staff });
    const second = await run(ArchiveProductAction, { productId }, { as: staff });

    expect(first).toRecord(ProductArchived, { productId, variantIds: [variantId] });
    expect(second).not.toRecord(ProductArchived);
    expect(app.events.published().ofType(ProductArchived)).toHaveLength(1);
  });

  /** A customer holds no `archive`; the product must still read as active afterwards. */
  it("refuses a customer and leaves the product on sale", async () => {
    const { productId } = await setup();
    const customer = actors.customer();

    const result = await run(ArchiveProductAction, { productId }, { as: customer });

    expect(result).toRefuseWith(refusal(ForbiddenError));
    expect(await run(GetProductQuery, { productId }, { as: customer })).toMatchObject({
      ok: true,
      output: { status: ProductStatus.Active },
    });
  });

  /** The cached view is warmed first; after archive the next read must see the new status. */
  it("forgets the cached view so the next read sees the new status", async () => {
    const { productId, staff } = await setup();
    await run(GetProductQuery, { productId }, { as: staff }); // warms the cached view

    await run(ArchiveProductAction, { productId }, { as: staff });

    expect(await run(GetProductQuery, { productId }, { as: staff })).toMatchObject({
      ok: true,
      output: { status: ProductStatus.Archived },
    });
  });
});
