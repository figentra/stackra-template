/**
 * Stackra file contract:
 * Purpose: when an order is paid, mail the customer a receipt with the authoritative totals.
 * Boundary: moved here from the notifications service (ADR 0223): the module that knows the order
 *           renders the mail and sends it through the `Mailer` port, like the confirmation.
 *           Notifications keeps delivery, preferences and the log. Runs once per event id.
 * Runtime: node
 * Governing contract: ADR 0078, ADR 0260 (command mode), guides/programming-model.mdx#mails, D.12,
 *                     ADR 0223
 */
import { OnEvent, type ListenerContext } from "@stackra/events";
import type { Mailer } from "@stackra/mail";
import { Queues } from "#stackra/queues";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import type { OrderService } from "#modules/orders/services/order.service";
import { OrderReceiptMail } from "#modules/orders/mails/order-receipt.mail";

/** One receipt per paid order; the Mailer derives the command key from the mail and recipient. */
export class SendOrderReceiptListener {
  constructor(
    private readonly orders: OrderService,
    private readonly mailer: Mailer,
  ) {}

  /** Queued on `Queues.Notifications`, beside the confirmation, so payment capture never waits. */
  @OnEvent(OrderPaid, { queue: Queues.Notifications })
  async handle(event: OrderPaid, _ctx: ListenerContext): Promise<void> {
    const row = await this.orders.findOneOrFail(
      { id: event.data.orderId },
      { populate: ["lines"] },
    );
    const order = this.orders.toView(row);
    await this.mailer.send(new OrderReceiptMail({ order }).to(event.data.customerId));
  }
}
