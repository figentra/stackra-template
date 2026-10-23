/**
 * Stackra file contract:
 * Purpose: the paid-order receipt: when an order is paid, mail the customer the authoritative
 *          totals.
 * Boundary: triggered by the type of `recipients`' parameter (OrderPaid), once per event id, on the
 *           notifications queue after commit, so payment capture never waits. The channels are the
 *           methods present (mail only); the mail template is order-receipt.mail.tsx, bound by
 *           name. Key `orders.order_receipt`; it appears on the order's View page in the Messages
 *           tab. Transactional, so preferences cannot mute it.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 4, 13, 16 and 20), ADR 0223 (notifications)
 */
import {
  type MailMessage,
  Notification,
  NotificationCategory,
  Recipient,
} from "@stackra/notifications";
import { I18n } from "#stackra/i18n";
import type { OrderPaid } from "#modules/orders/events/order-paid.event";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";
import type { OrderService } from "#modules/orders/services/order.service";

/** What the mail renders. */
export interface OrderReceiptData {
  /** The paid order with its final totals and lines. */
  readonly order: OrderView;
}

/** One receipt per paid order, never one per delivery of the capture. */
export class OrderReceiptNotification extends Notification({
  category: NotificationCategory.Transactional,
}) {
  /** @param orders - reads the paid order and maps it to OrderView. */
  constructor(private readonly orders: OrderService) {
    super();
  }

  /** The customer who paid. */
  recipients(event: OrderPaid): Recipient[] {
    return [Recipient.principal(event.customerId)];
  }

  /** Reads the stored order once, for every channel. */
  async data(event: OrderPaid): Promise<OrderReceiptData> {
    const row = await this.orders.findOneOrFail({ id: event.orderId }, { populate: ["lines"] });
    return { order: this.orders.toView(row) };
  }

  /** The subject line, with the order id, in the recipient's locale. */
  mail({ order }: OrderReceiptData, mail: MailMessage): MailMessage {
    return mail.subject(I18n.orders.order_receipt.mail.subject, { id: order.id });
  }
}
