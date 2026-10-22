/**
 * Stackra file contract:
 * Purpose: proves a customer can never adjust stock, while staff and services are left to their
 *          permission.
 * Boundary: unit tier; the policy is called directly.
 * Runtime: node
 * Governing contract: ADR 0132 d4, ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { Decision } from "@stackra/iam";
import { createTestingModule } from "@stackra/container/testing";
import { InventoryModule } from "#modules/inventory/inventory.module";
import { StockPolicy } from "#modules/inventory/policies/stock.policy";

/** Guards the L2 manage verb on stock levels. */
describe(StockPolicy, () => {
  /** A customer granted a stock role by mistake is still denied. */
  it("denies customers and abstains for staff and services", async () => {
    const mod = await createTestingModule(InventoryModule).compile();
    const policy = mod.get(StockPolicy);

    expect(policy.manage(actors.customer())).toBe(Decision.Deny);
    expect(policy.manage(actors.staff())).toBe(Decision.Abstain);
    expect(policy.manage(actors.service("pos"))).toBe(Decision.Abstain);
  });
});
