/**
 * Stackra file contract:
 * Purpose: proves a payments capture for an order marks it paid, and a capture whose reference is
 *          not an order id never reaches the listener.
 * Boundary: unit tier; the remote event is injected through the memory inbox; ids of commerce
 *           records come from the factory, the payment id is the event's own.
 * Runtime: node
 * Governing contract: ADR 0260 d3, ADR 0078 d4, ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { deliverRemoteEvent, drainOutbox } from "@stackra/events/testing";
import { Payments } from "#stackra/clients";
import { CommerceModule } from "#src/commerce.module";
import { MarkOrderPaidListener } from "#modules/orders/listeners/mark-order-paid.listener";
import { Order } from "#modules/orders/models/order.model";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderFactory } from "#modules/orders/factories/order.factory";

/** Guards the bridge from the payments service into the order lifecycle. */
describe(MarkOrderPaidListener, () => {
  /** The capture names the order; a gift-card capture is filtered out at the subscription. */
  it("marks the referenced order paid and ignores other references", async () => {
    const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const order = await new OrderFactory(app.em).state("authorized").createOne();
    const capture = { paymentId: order.paymentId!, amountMinor: order.totalMinor, currency: "USD" };

    await deliverRemoteEvent(Payments.events.PaymentCaptured, { ...capture, reference: order.id });
    await deliverRemoteEvent(Payments.events.PaymentCaptured, { ...capture, reference: "gft_1" });
    await drainOutbox();

    const saved = await app.repository(Order).findOneOrFail({ id: order.id });
    expect(saved.status.value).toBe(OrderStatus.Paid);
    expect(app.listeners.calls(MarkOrderPaidListener)).toHaveLength(1);
  });
});
