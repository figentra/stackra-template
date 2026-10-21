/**
 * Stackra file contract:
 * Purpose: proves the record-level cancel rule: staff abstain, owners are allowed only while the
 *          tenant permits it, nobody cancels a paid order, and a service is judged as the customer
 *          it acts for.
 * Boundary: unit tier; the policy is called directly with factory records (`make`, not persisted)
 *           and fake settings. Customer ids are the ones the factory minted.
 * Runtime: node
 * Governing contract: ADR 0132 d4, 0022, guides/programming-model.mdx#policies-and-guards, ADR 0207
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { Decision } from "@stackra/iam";
import { createTestingModule } from "@stackra/container/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { OrdersModule } from "#modules/orders/orders.module";
import { OrderPolicy } from "#modules/orders/policies/order.policy";
import { OrderSettings } from "#modules/orders/settings/order.setting";
import { OrderFactory } from "#modules/orders/factories/order.factory";

/** A policy bound to a tenant whose `customersMayCancel` is as given, plus an unsaved factory. */
async function setup(customersMayCancel: boolean) {
  const settings = fakeSettings([
    [OrderSettings, { autoCancelAfterMinutes: 30, customersMayCancel }],
  ]);
  const mod = await createTestingModule(OrdersModule).override(SettingsReader, settings).compile();
  return { policy: mod.get(OrderPolicy), orders: new OrderFactory(mod.em) };
}

/** Guards who may cancel an order, a rule that depends on state, ownership and tenant settings. */
describe(OrderPolicy, () => {
  /** A paid order is final for everyone, whatever the role or setting says. */
  it("denies everyone once the order is paid", async () => {
    const { policy, orders } = await setup(true);
    expect(await policy.cancel(actors.staff(), orders.state("paid").makeOne())).toBe(Decision.Deny);
  });

  /** Staff never get an opinion from the policy; their role's permission is the whole answer. */
  it("abstains for staff, so the permission alone decides", async () => {
    const { policy, orders } = await setup(false);
    expect(await policy.cancel(actors.staff(), orders.makeOne())).toBe(Decision.Abstain);
  });

  /** Ownership and the tenant switch must both hold; a stranger is denied even when it is on. */
  it("allows the owner only while the tenant permits customer cancellation", async () => {
    const on = await setup(true);
    const off = await setup(false);
    const [mine, theirs] = on.orders.makeMany(2);
    const owner = actors.customer(mine.customerId);

    expect(await on.policy.cancel(owner, mine)).toBe(Decision.Allow);
    expect(await off.policy.cancel(owner, mine)).toBe(Decision.Deny);
    expect(await on.policy.cancel(actors.customer(theirs.customerId), mine)).toBe(Decision.Deny);
  });

  /**
   * The inbound-mail relay: no principal means deny; on behalf of the owner means the owner's rule.
   */
  it("judges a service as the customer it acts for", async () => {
    const { policy, orders } = await setup(true);
    const order = orders.makeOne();
    const forOwner = actors.service("notifications", {
      onBehalfOf: actors.customer(order.customerId),
    });

    expect(await policy.cancel(actors.service("notifications"), order)).toBe(Decision.Deny);
    expect(await policy.cancel(forOwner, order)).toBe(Decision.Allow);
  });
});
