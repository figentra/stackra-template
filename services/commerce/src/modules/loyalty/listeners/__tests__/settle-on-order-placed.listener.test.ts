/**
 * Stackra file contract:
 * Purpose: proves a placed order's held points settle into a redemption without moving the
 *          balance, once, and that an order that redeemed nothing settles nothing.
 * Boundary: unit tier; the order is placed through the real pipeline (`run`) so the hold is taken
 *           by HoldPointsExtension, and `order.placed` reaches the listener when the outbox is
 *           drained; the kit runs on its memory ledger; the pricing and payments clients are in
 *           the one fake shape. Membership comes from a paid order built by the factory.
 * Runtime: node
 * Governing contract: ADR 0078 (listeners run once per event id), ADR 0265, ADR 0022
 */
import assert from "node:assert/strict";
import { LoyaltyKitConfig, memberId } from "@acme/loyalty-kit";
import { EntryKind, LoyaltyLedger } from "@acme/loyalty-kit/contracts";
import { pointsEntry } from "@acme/loyalty-kit/testing";
import { run } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { drainOutbox } from "@stackra/events/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { AuthorizePaymentAction, PaymentsClient } from "#stackra/clients/payments";
import { PricingClient, QuotePriceQuery } from "#stackra/clients/pricing";
import { CommerceModule } from "#stackra/module";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/database/factories/variant.factory";
import { StockLevelFactory } from "#modules/inventory/database/factories/stock-level.factory";
import { SettleOnOrderPlacedListener } from "#modules/loyalty/listeners/settle-on-order-placed.listener";
import { CreateOrderAction } from "#modules/orders/actions/create-order.action";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";

/**
 * A member with 100 points, one in-stock variant priced at 1 000 minor units (so the kit's 50 %
 * cap leaves room for every point), and succeeding pricing and payments fakes.
 */
async function setup() {
  const app = await createTestingModule(CommerceModule)
    .useDrivers("memory")
    .withConfig(LoyaltyKitConfig, { ledger: "memory", pointValueMinor: 1, maxRedeemPercent: 50 })
    .override(
      PricingClient,
      fakeClient((fake) =>
        fake.on(QuotePriceQuery).returns(({ lines }) => ({
          currency: "SAR",
          lines: lines.map((line) => ({ ...line, unitPriceMinor: 1_000 })),
        })),
      ),
    )
    .override(
      PaymentsClient,
      fakeClient((fake) =>
        fake.on(AuthorizePaymentAction).returns({ paymentId: "pay_1", clientSecret: "secret_1" }),
      ),
    )
    .compile();
  const as = actors.customer();
  await OrderFactory.new().paid().create({ customerId: as.id }); // a paid order makes a member
  const ledger = app.get(LoyaltyLedger);
  await ledger.append(pointsEntry.build({ memberId: memberId(as.id), points: 100 }));
  const product = await ProductFactory.new().has(VariantFactory.new()).create();
  const [variant] = product.variants;
  assert(variant, "the factory made one variant");
  await StockLevelFactory.new().create({ variantId: variant.id, onHand: 10 });
  const input = (redeemPoints?: number) => ({
    lines: [{ variantId: variant.id, quantity: 1 }],
    extensions: redeemPoints ? { loyalty: { redeemPoints } } : {},
  });
  return { app, as, ledger, input };
}

/** Guards the step that turns held points into the order's redemption. */
describe(SettleOnOrderPlacedListener, () => {
  /** The hold already took the points; settling records the redemption and leaves the balance. */
  it("settles the hold into a redemption without moving the balance", async () => {
    const { as, ledger, input } = await setup();
    const member = memberId(as.id);

    const placed = await run(CreateOrderAction, input(40), { as, idempotencyKey: "k1" });
    expect(await ledger.balance(member)).toBe(60);
    await drainOutbox(); // publishes order.placed and runs the listener
    await drainOutbox(); // nothing left: the listener ran once

    const redeemed = await ledger.find(member, placed.output.orderId);
    expect(redeemed).toMatchObject({ kind: EntryKind.Redeem, points: -40 });
    expect(await ledger.balance(member)).toBe(60);
  });

  /** An order without the loyalty input writes no redemption. */
  it("settles nothing for an order that redeemed no points", async () => {
    const { as, ledger, input } = await setup();

    const placed = await run(CreateOrderAction, input(), { as, idempotencyKey: "k2" });
    await drainOutbox();

    expect(await ledger.find(memberId(as.id), placed.output.orderId)).toBeNull();
    expect(await ledger.balance(memberId(as.id))).toBe(100);
  });
});
