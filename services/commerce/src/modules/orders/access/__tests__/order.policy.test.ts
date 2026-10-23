/**
 * Stackra file contract:
 * Purpose: proves the record-level cancel rule: staff abstain, owners are allowed only while the
 *          tenant permits it, nobody cancels a paid order, and a service is judged as the customer
 *          it acts for.
 * Boundary: unit tier; the policy is called directly with unsaved factory records (`make`) and fake
 *           settings. Customer ids are the ones the factory minted.
 * Runtime: node
 * Governing contract: ADR 0132 d4, ADR 0022
 */
import { createTestingModule } from "@stackra/container/testing";
import { Decision } from "@stackra/iam";
import { actors } from "@stackra/iam/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { describe, expect, it } from "@stackra/testing";
import { OrderPolicy } from "#modules/orders/access/order.policy";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { OrdersModule } from "#modules/orders/orders.module";
import { OrdersSettings } from "#modules/orders/orders.settings";

/** A policy bound to a tenant whose `customersMayCancel` is as given. */
async function policyFor(customersMayCancel: boolean): Promise<OrderPolicy> {
  const settings = fakeSettings([
    [OrdersSettings, { cancellation: { autoCancelAfterMinutes: 30, customersMayCancel } }],
  ]);
  const mod = await createTestingModule(OrdersModule).override(SettingsReader, settings).compile();
  return mod.get(OrderPolicy);
}

/** Guards who may cancel an order, a rule that depends on state, ownership and tenant settings. */
describe(OrderPolicy, () => {
  /** A paid order is final for everyone, whatever the role or setting says. */
  it("denies everyone once the order is paid", async () => {
    const policy = await policyFor(true);
    expect(await policy.cancel(actors.staff(), OrderFactory.new().paid().make())).toBe(
      Decision.Deny,
    );
  });

  /** Staff never get an opinion from the policy; their role's permission is the whole answer. */
  it("abstains for staff, so the permission alone decides", async () => {
    const policy = await policyFor(false);
    expect(await policy.cancel(actors.staff(), OrderFactory.new().make())).toBe(Decision.Abstain);
  });

  /** Ownership and the tenant switch must both hold; a stranger is denied even when it is on. */
  it("allows the owner only while the tenant permits customer cancellation", async () => {
    const on = await policyFor(true);
    const off = await policyFor(false);
    const [mine, theirs] = OrderFactory.new().count(2).make();
    const owner = actors.customer(mine.customerId);

    expect(await on.cancel(owner, mine)).toBe(Decision.Allow);
    expect(await off.cancel(owner, mine)).toBe(Decision.Deny);
    expect(await on.cancel(actors.customer(theirs.customerId), mine)).toBe(Decision.Deny);
  });

  /**
   * The inbound-mail relay: no principal means deny; on behalf of the owner means the owner's rule.
   */
  it("judges a service as the customer it acts for", async () => {
    const policy = await policyFor(true);
    const order = OrderFactory.new().make();
    const forOwner = actors.service("notifications", {
      onBehalfOf: actors.customer(order.customerId),
    });

    expect(await policy.cancel(actors.service("notifications"), order)).toBe(Decision.Deny);
    expect(await policy.cancel(forOwner, order)).toBe(Decision.Allow);
  });
});
