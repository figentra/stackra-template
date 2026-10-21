/**
 * Stackra file contract:
 * Purpose: proves the generated `catalogue.product.create` refuses once the tenant's plan limit of
 *          products is reached, and creates below it.
 * Boundary: unit tier through the pipeline; the entitlements service is faked with
 *           `fakeEntitlements`, the products come from the factory.
 * Runtime: node
 * Governing contract: ADR 0213 d3, ADR 0022, ADR 0127
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { refusal } from "@stackra/errors/testing";
import { fakeEntitlements } from "@stackra/entitlements/testing";
import { EntitlementSource } from "@stackra/entitlements";
import { ProductCrud } from "#stackra/crud";
import { Refusals } from "#stackra/manifest";
import { CommerceModule } from "#src/commerce.module";
import { ProductLimit } from "#modules/catalogue/entitlements/product-limit.entitlement";
import { ProductFactory } from "#modules/catalogue/factories/product.factory";

/** A tenant on a plan that allows two products. */
async function setup() {
  return createTestingModule(CommerceModule)
    .useDrivers("memory")
    .override(EntitlementSource, fakeEntitlements([[ProductLimit, 2]]))
    .compile();
}

/** Guards the plan gate on product creation, a commercial promise the template must keep. */
describe(ProductLimit, () => {
  /** One product exists; a second fits the plan. */
  it("creates a product below the limit", async () => {
    const app = await setup();
    await new ProductFactory(app.em).createOne();
    const input = new ProductFactory(app.em).makeOne();

    const result = await run(ProductCrud.Create, input, { as: actors.staff() });

    expect(result).toMatchObject({ ok: true });
  });

  /** Two products exist; a third must refuse with the entitlements package's code. */
  it("refuses a product past the limit", async () => {
    const app = await setup();
    await new ProductFactory(app.em).createMany(2);
    const input = new ProductFactory(app.em).makeOne();

    const result = await run(ProductCrud.Create, input, { as: actors.staff() });

    expect(result).toRefuseWith(refusal(Refusals.entitlements.limit_reached));
  });
});
