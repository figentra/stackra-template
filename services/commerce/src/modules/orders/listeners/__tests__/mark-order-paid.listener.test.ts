/**
 * Stackra file contract:
 * Purpose: proves a payments capture for an order marks it paid, and a capture whose reference is
 *          not an order id leaves every order untouched.
 * Boundary: unit tier; the remote event is injected through the memory inbox; ids of commerce
 *           records come from the factory, the payment id is the event's own.
 * Runtime: node
 * Governing contract: ADR 0260 d3, ADR 0078 d4, ADR 0022
 */
import assert from "node:assert/strict";
import { createTestingModule } from "@stackra/container/testing";
import { deliverRemoteEvent, drainOutbox } from "@stackra/events/testing";
import { describe, expect, it } from "@stackra/testing";
import { PaymentCaptured } from "#stackra/clients/payments";
import { CommerceModule } from "#stackra/module";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { MarkOrderPaidListener } from "#modules/orders/listeners/mark-order-paid.listener";
import { Order } from "#modules/orders/models/order.model";

/** Guards the bridge from the payments service into the order lifecycle. */
describe(MarkOrderPaidListener, () => {
  /** The capture names the order; a gift-card capture is delivered too and changes nothing. */
  it("marks the referenced order paid and ignores other references", async () => {
    const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const order = await OrderFactory.new().authorized().create();
    assert(order.paymentId, "an authorized order carries its payment id");
    const capture = {
      paymentId: order.paymentId,
      amountMinor: order.total.minor,
      currency: order.total.currency,
    };

    await deliverRemoteEvent(PaymentCaptured, { ...capture, reference: order.id });
    await deliverRemoteEvent(PaymentCaptured, { ...capture, reference: "gft_1" });
    await drainOutbox();

    const saved = await app.repository(Order).findOneOrFail({ id: order.id });
    expect(saved.status).toBe(OrderStatus.Paid);
    expect(app.listeners.calls(MarkOrderPaidListener)).toHaveLength(2);
    expect(app.listeners.failures(MarkOrderPaidListener)).toHaveLength(0);
    expect(await app.repository(Order).count({ status: OrderStatus.Paid })).toBe(1);
  });
});
