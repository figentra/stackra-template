/**
 * Stackra file contract:
 * Purpose: proves a paid order sends one receipt to its customer, even when the capture is
 *          delivered twice.
 * Boundary: unit tier; memory drivers, so the notifier is the memory notifier and the outbox is
 *           drained by hand. Ids come from the factory.
 * Runtime: node
 * Governing contract: ADR 0078 (once per event id), ADR 0223 (notifications), ADR 0022
 */
import assert from "node:assert/strict";
import { createTestingModule } from "@stackra/container/testing";
import { drainOutbox } from "@stackra/events/testing";
import { Notifier, Recipient } from "@stackra/notifications";
import type { MemoryNotifier } from "@stackra/notifications/testing";
import { describe, expect, it } from "@stackra/testing";
import { CommerceModule } from "#src/commerce.module";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { OrderReceiptNotification } from "#modules/orders/resources/order/order-receipt.notification";
import { OrderService } from "#modules/orders/services/order.service";

/** Guards the receipt: a customer is notified once per paid order, never once per delivery. */
describe(OrderReceiptNotification, () => {
  /** `markPaid` twice with the same payment records one `order.paid`, so one receipt is sent. */
  it("sends one receipt per paid order", async () => {
    const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const order = await OrderFactory.new().authorized().create();
    const orders = app.get(OrderService);
    const { paymentId } = order;
    assert(paymentId, "an authorized order carries its payment id");

    await orders.markPaid(order.id, paymentId, new Date());
    await orders.markPaid(order.id, paymentId, new Date()); // a redelivered capture
    await drainOutbox();

    const sent = (app.get(Notifier) as MemoryNotifier).sent(OrderReceiptNotification);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.recipient).toEqual(Recipient.principal(order.customerId));
  });
});
