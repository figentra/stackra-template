/**
 * Stackra file contract:
 * Purpose: proves a paid order earns points once, through the outbox and the kit's AccountService,
 *          and that a redelivered capture earns nothing more.
 * Boundary: unit tier; memory outbox and queue drained by hand, the kit on its memory ledger chosen
 *           by a checked driver-name literal (ADR 0266). Ids come from the factory.
 * Runtime: node
 * Governing contract: ADR 0078 (listeners run once per event id), ADR 0022,
 *                     guides/programming-model.mdx#listeners, ADR 0265
 */
import { describe, expect, it } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { drainOutbox } from "@stackra/events/testing";
import { LoyaltyKitConfig } from "@acme/loyalty-kit";
import { PointsEarned } from "@acme/loyalty-kit/node";
import { CommerceModule } from "#src/commerce.module";
import { EarnOnOrderPaidListener } from "#modules/loyalty/listeners/earn-on-order-paid.listener";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderFactory } from "#modules/orders/factories/order.factory";

/** Guards points earning on payment, where a replayed event must not double-credit. */
describe(EarnOnOrderPaidListener, () => {
  /** 2 000 minor at 0.1 per minor = 200 points; the second `markPaid` records no second event. */
  it("earns floor(total × rate) once per order", async () => {
    const app = await createTestingModule(CommerceModule)
      .useDrivers("memory")
      .withConfig(LoyaltyKitConfig, { ledger: "memory", earnPerMinor: 0.1 })
      .compile();
    const order = await new OrderFactory(app.em)
      .state("authorized")
      .createOne({ subtotalMinor: 2_000, totalMinor: 2_000 });
    const orders = app.get(OrderService);

    await orders.markPaid(order.id, order.paymentId!, new Date());
    await drainOutbox(); // publishes order.paid and runs the queued listener
    await orders.markPaid(order.id, order.paymentId!, new Date()); // idempotent: records nothing
    await drainOutbox();

    expect(app.events.published()).toEmit(PointsEarned, { points: 200, reference: order.id });
    expect(app.events.published().ofType(PointsEarned)).toHaveLength(1);
  });
});
