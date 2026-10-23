/**
 * Stackra file contract:
 * Purpose: proves points are never overdrawn: two orders placed at the same time, each redeeming
 *          the customer's whole balance, place one and refuse the other with
 *          `insufficient_points`, its order rolled back and its stock released; and an order that
 *          redeems nothing holds nothing.
 * Boundary: unit tier through the real pipeline (`run`) and the memory workflow engine, the kit on
 *           its memory ledger (whose covered debit mirrors the postgres row lock); the pricing and
 *           payments clients in the one fake shape. Membership comes from a paid order built by
 *           the factory; the balance is one earn entry from the kit's fixture.
 * Runtime: node
 * Governing contract: ADR 0265 (extension points), ADR 0098, ADR 0022
 */
import assert from "node:assert/strict";
import { InsufficientPointsError, LoyaltyKitConfig, memberId } from "@acme/loyalty-kit";
import { LoyaltyLedger } from "@acme/loyalty-kit/contracts";
import { pointsEntry } from "@acme/loyalty-kit/testing";
import { run } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { AuthorizePaymentAction, PaymentsClient } from "#stackra/clients/payments";
import { PricingClient, QuotePriceQuery } from "#stackra/clients/pricing";
import { CommerceModule } from "#stackra/module";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/database/factories/variant.factory";
import { StockLevelFactory } from "#modules/inventory/database/factories/stock-level.factory";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import { HoldPointsExtension } from "#modules/loyalty/extensions/hold-points.extension";
import { CreateOrderAction } from "#modules/orders/actions/create-order.action";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { Order } from "#modules/orders/models/order.model";

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
  const level = await StockLevelFactory.new().create({ variantId: variant.id, onHand: 10 });
  const input = (redeemPoints?: number) => ({
    lines: [{ variantId: variant.id, quantity: 1 }],
    extensions: redeemPoints ? { loyalty: { redeemPoints } } : {},
  });
  return { app, as, ledger, level, input };
}

/** Guards the one place redeemed points leave the balance. */
describe(HoldPointsExtension, () => {
  /**
   * Both orders pass pricing and the early balance check before either is written; the hold is
   * the atomic check, so the second is refused and nothing is overdrawn.
   */
  it("places one of two concurrent orders redeeming the balance, refusing the other", async () => {
    const { app, as, ledger, level, input } = await setup();

    const [first, second] = await Promise.all([
      run(CreateOrderAction, input(100), { as, idempotencyKey: "k1" }),
      run(CreateOrderAction, input(100), { as, idempotencyKey: "k2" }),
    ]);
    const [placed, refused] = first.ok ? [first, second] : [second, first];

    expect(placed.ok).toBe(true);
    expect(refused).toRefuseWith(refusal(InsufficientPointsError));
    expect(await ledger.balance(memberId(as.id))).toBe(0);
    const pending = await app.repository(Order).find({ status: OrderStatus.PendingPayment });
    expect(pending).toHaveLength(1);
    expect((await app.repository(StockLevel).findOneOrFail({ id: level.id })).reserved).toBe(1);
  });

  /** An order without the loyalty input holds nothing. */
  it("holds nothing for an order that redeems no points", async () => {
    const { as, ledger, input } = await setup();

    const result = await run(CreateOrderAction, input(), { as, idempotencyKey: "k3" });

    expect(result.ok).toBe(true);
    expect(await ledger.balance(memberId(as.id))).toBe(100);
  });
});
