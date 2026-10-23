/**
 * Stackra file contract:
 * Purpose: proves a paid order earns points once, through the outbox and the kit's AccountService,
 *          and that a redelivered capture earns nothing more.
 * Boundary: unit tier; memory outbox and queue drained by hand, the kit on its memory ledger chosen
 *           by a checked driver-name literal (ADR 0266). Ids come from the factory.
 * Runtime: node
 * Governing contract: ADR 0078 (listeners run once per event id), ADR 0265, ADR 0022
 */
import assert from "node:assert/strict";
import { LoyaltyKitConfig } from "@acme/loyalty-kit";
import { PointsEarned } from "@acme/loyalty-kit/node";
import { createTestingModule } from "@stackra/container/testing";
import { drainOutbox } from "@stackra/events/testing";
import { Money } from "@stackra/money";
import { describe, expect, it } from "@stackra/testing";
import { CommerceModule } from "#stackra/module";
import { EarnOnOrderPaidListener } from "#modules/loyalty/listeners/earn-on-order-paid.listener";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { OrderService } from "#modules/orders/services/order.service";

/** Guards points earning on payment, where a replayed event must not double-credit. */
describe(EarnOnOrderPaidListener, () => {
  /** 2 000 minor at 0.1 per minor = 200 points; the second `markPaid` records no second event. */
  it("earns floor(total × rate) once per order", async () => {
    const app = await createTestingModule(CommerceModule)
      .useDrivers("memory")
      .withConfig(LoyaltyKitConfig, { ledger: "memory", earnPerMinor: 0.1 })
      .compile();
    const total = Money.ofMinor(2_000, "USD");
    const order = await OrderFactory.new().authorized().create({ subtotal: total, total });
    const orders = app.get(OrderService);
    const { paymentId } = order;
    assert(paymentId, "an authorized order carries its payment id");

    await orders.markPaid(order.id, paymentId, new Date());
    await drainOutbox(); // publishes order.paid and runs the queued listener
    await orders.markPaid(order.id, paymentId, new Date()); // idempotent: records nothing
    await drainOutbox();

    expect(app.events.published()).toEmit(PointsEarned, { points: 200, reference: order.id });
    expect(app.events.published().ofType(PointsEarned)).toHaveLength(1);
  });
});
