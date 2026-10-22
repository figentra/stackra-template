/**
 * Stackra file contract:
 * Purpose: proves a paid order sends one receipt through the Mailer port, even when the capture is
 *          delivered twice.
 * Boundary: unit tier; memory drivers, so the Mailer is the memory mailer and the outbox is drained
 *           by hand. Ids come from the factory.
 * Runtime: node
 * Governing contract: ADR 0078 (listeners run once per event id), ADR 0022, ADR 0223
 */
import { describe, expect, it } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { drainOutbox } from "@stackra/events/testing";
import { Mailer } from "@stackra/mail";
import { MemoryMailer } from "@stackra/mail/testing";
import { CommerceModule } from "#src/commerce.module";
import { SendOrderReceiptListener } from "#modules/orders/listeners/send-order-receipt.listener";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderReceiptMail } from "#modules/orders/mails/order-receipt.mail";
import { OrderFactory } from "#modules/orders/factories/order.factory";

/** Guards the receipt: a customer is mailed once per paid order, never per delivery. */
describe(SendOrderReceiptListener, () => {
  /** `markPaid` twice with the same payment records one `order.paid`, so one receipt is sent. */
  it("sends one receipt per paid order", async () => {
    const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const order = await new OrderFactory(app.em).state("authorized").createOne();
    const orders = app.get(OrderService);

    await orders.markPaid(order.id, order.paymentId!, new Date());
    await orders.markPaid(order.id, order.paymentId!, new Date()); // a redelivered capture
    await drainOutbox();

    const sent = (app.get(Mailer) as MemoryMailer).sent(OrderReceiptMail);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.recipient).toBe(order.customerId);
  });
});
