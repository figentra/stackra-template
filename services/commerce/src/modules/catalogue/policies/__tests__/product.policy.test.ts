/**
 * Stackra file contract:
 * Purpose: proves only the tenant's own staff may archive a product; customers and services are
 *          denied whatever role they hold.
 * Boundary: unit tier; the policy is called directly with an unsaved factory record.
 * Runtime: node
 * Governing contract: ADR 0132 d4, ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { Decision } from "@stackra/iam";
import { createTestingModule } from "@stackra/container/testing";
import { CatalogueModule } from "#modules/catalogue/catalogue.module";
import { ProductPolicy } from "#modules/catalogue/policies/product.policy";

/** Guards the L2 archive verb, which gen requires a policy method for. */
describe(ProductPolicy, () => {
  /** Staff abstain (the role decides); a customer and a service are denied outright. */
  it("lets only tenant staff reach the archive permission", async () => {
    const mod = await createTestingModule(CatalogueModule).compile();
    const policy = mod.get(ProductPolicy);

    expect(policy.archive(actors.staff())).toBe(Decision.Abstain);
    expect(policy.archive(actors.customer())).toBe(Decision.Deny);
    expect(policy.archive(actors.service("notifications"))).toBe(Decision.Deny);
  });
});
