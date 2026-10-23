/**
 * Stackra file contract:
 * Purpose: proves the generated `catalogue.product.create@1` creates below the tenant's plan limit
 *          of products and refuses once the limit is reached.
 * Boundary: unit tier through the pipeline; the entitlements service is faked with
 *           `fakeEntitlements`, the products come from the factory.
 * Runtime: node
 * Governing contract: ADR 0213 d3, ADR 0138 (as amended: the entitlement step), ADR 0022
 */
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { EntitlementSource } from "@stackra/entitlements";
import { fakeEntitlements } from "@stackra/entitlements/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { Refusals } from "#stackra/manifest";
import { ProductOperations } from "#stackra/operations";
import { CommerceModule } from "#src/commerce.module";
import { ProductLimitEntitlement } from "#modules/catalogue/access/product-limit.entitlement";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";

/** A tenant on a plan that allows two products. */
async function setup() {
  return createTestingModule(CommerceModule)
    .useDrivers("memory")
    .override(EntitlementSource, fakeEntitlements([[ProductLimitEntitlement, 2]]))
    .compile();
}

/** Guards the plan gate on product creation, a commercial promise the template must keep. */
describe(ProductLimitEntitlement, () => {
  /** One product exists; a second fits the plan. */
  it("creates a product below the limit", async () => {
    await setup();
    await ProductFactory.new().create();
    const input = ProductFactory.new().make();

    const result = await run(ProductOperations.Create, input, { as: actors.staff() });

    expect(result).toMatchObject({ ok: true });
  });

  /** Two products exist; a third must refuse with the entitlements package's code. */
  it("refuses a product past the limit", async () => {
    await setup();
    await ProductFactory.new().count(2).create();
    const input = ProductFactory.new().make();

    const result = await run(ProductOperations.Create, input, { as: actors.staff() });

    expect(result).toRefuseWith(refusal(Refusals.entitlements.limit_reached));
  });
});
