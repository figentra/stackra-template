/**
 * Stackra file contract:
 * Purpose: the order confirmation: when an order is placed, mail the customer a link to it.
 * Boundary: triggered by the type of `recipients`' parameter (OrderPlaced), once per event id, on
 *           the notifications queue after commit, so a slow mail provider never delays placement.
 *           The channels are the methods present (mail only); the mail template is
 *           order-placed.mail.tsx, bound by name. Key `orders.order_placed`; it appears on the
 *           order's View page in the Messages tab. Transactional, so preferences cannot mute it.
 *           The rendered data is OrderPlacedData in schemas/ (one declaration per file).
 *           @stackra/notifications delivers through the driver runway selects; the notifications
 *           service owns delivery, preferences and the log, never the template.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 4, 13, 16 and 20), ADR 0223 (notifications)
 */
import {
  type MailMessage,
  Notification,
  NotificationCategory,
  Recipient,
} from "@stackra/notifications";
import type { CommerceConfig } from "#config/commerce.config";
import { I18n } from "#stackra/i18n";
import type { OrderPlaced } from "#modules/orders/events/order-placed.event";
import { OrderPlacedData } from "#modules/orders/schemas/order-placed-data.schema";
import type { OrderService } from "#modules/orders/services/order.service";

/** One confirmation per placed order. */
export class OrderPlacedNotification extends Notification({
  category: NotificationCategory.Transactional,
}) {
  /** @param config - the storefront base URL comes from the commerce config. */
  constructor(
    private readonly orders: OrderService,
    private readonly config: CommerceConfig,
  ) {
    super();
  }

  /** The customer who placed the order. */
  recipients(event: OrderPlaced): Recipient[] {
    return [Recipient.principal(event.customerId)];
  }

  /** Reads the stored order once, for every channel. */
  async data(event: OrderPlaced): Promise<OrderPlacedData> {
    const row = await this.orders.findOneOrFail({ id: event.orderId }, { populate: ["lines"] });
    const order = this.orders.toView(row);
    const url = new URL(`orders/${order.id}`, this.config.storefrontBaseUrl).href;
    return OrderPlacedData.create({ order, url });
  }

  /** The subject line, with the order id, in the recipient's locale. */
  mail({ order }: OrderPlacedData, mail: MailMessage): MailMessage {
    return mail.subject(I18n.orders.order_placed.mail.subject, { id: order.id });
  }
}
