/**
 * Stackra file contract:
 * Purpose: proves only the tenant's own staff may reach the archive permission; customers and
 *          services are denied whatever role they hold.
 * Boundary: unit tier; the policy is called directly from the catalogue module alone.
 * Runtime: node
 * Governing contract: ADR 0132 d4, ADR 0022
 */
import { createTestingModule } from "@stackra/container/testing";
import { Decision } from "@stackra/iam";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { ProductPolicy } from "#modules/catalogue/access/product.policy";
import { CatalogueModule } from "#modules/catalogue/catalogue.module";

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
