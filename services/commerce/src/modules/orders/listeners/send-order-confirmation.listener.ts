/**
 * Stackra file contract:
 * Purpose: when an order is placed, mail the customer a confirmation.
 * Boundary: a listener reacts; it is not callable. `queue` runs it on a worker after commit. The
 *           producer renders the mail (mails/order-placed.mail.tsx); the Mailer driver that
 *           `MailConfig.driver` names (runway `drivers.mail`) queues `message.send` on
 *           notifications. Notifications owns delivery, preferences and the log, never the
 *           template.
 * Runtime: node
 * Governing contract: ADR 0078, ADR 0260 (command mode), guides/programming-model.mdx#mails, D.12,
 *                     ADR 0266
 */
import { OnEvent, type ListenerContext } from "@stackra/events";
import { Mailer } from "@stackra/mail";
import { Queues } from "#stackra/queues";
import { CommerceConfig } from "#config/commerce.config";
import { OrderPlaced } from "#modules/orders/events/order-placed.event";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderPlacedMail } from "#modules/orders/mails/order-placed.mail";

/** One confirmation per order; notifications deduplicates by the command key the Mailer derives. */
export class SendOrderConfirmationListener {
  /** @param config - the same-named config class, injected by type without `@Inject`. */
  constructor(
    private readonly orders: OrderService,
    private readonly mailer: Mailer,
    private readonly config: CommerceConfig,
  ) {}

  /** Queued on `Queues.Notifications` so a slow mail provider never delays order placement. */
  @OnEvent(OrderPlaced, { queue: Queues.Notifications })
  async handle(event: OrderPlaced, _ctx: ListenerContext): Promise<void> {
    const row = await this.orders.findOneOrFail(
      { id: event.data.orderId },
      { populate: ["lines"] },
    );
    const order = this.orders.toView(row);
    const url = new URL(`orders/${order.id}`, this.config.storefrontBaseUrl).href;
    await this.mailer.send(new OrderPlacedMail({ order, url }).to(event.data.customerId));
  }
}
