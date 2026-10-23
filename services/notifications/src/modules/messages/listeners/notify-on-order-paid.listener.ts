/**
 * Stackra file contract:
 * Purpose: when commerce reports a paid order, add an entry to the customer's in-app inbox. The
 *          consumer side of a cross-service event, plus a call for the line count.
 * Boundary: subscribed to `orders.order.paid.v1` by the type of the event parameter, a class gen
 *           writes into `#stackra/clients` from commerce's committed stackra.manifest.json;
 *           CommerceClient is injected by class, and nothing here imports commerce code. Queued on
 *           `inbox`, so a slow commerce call never blocks the event inbox; runs once per event id.
 *           Honours the customer's MessagesSettings (`orderUpdates`) and records
 *           `messages.notification.created.v1`, whose broadcast refreshes the inbox.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0260 d3 and d4 (events and calls across
 *                     services), ADR 0078 d4 (listener semantics)
 */
import type { Repository } from "@stackra/database";
import { Listener } from "@stackra/events";
import type { SettingsReader } from "@stackra/settings";
import type { Commerce, CommerceClient } from "#stackra/clients";
import { Queues } from "#stackra/queues";
import { NotificationKind } from "#modules/messages/enums/notification-kind.enum";
import { NotificationCreated } from "#modules/messages/events/notification-created.event";
import { MessagesSettings } from "#modules/messages/messages.settings";
import type { Notification } from "#modules/messages/models/notification.model";

/** The only consumer of commerce's payment fact in this service. */
export class NotifyOnOrderPaidListener extends Listener({ queue: Queues.Inbox }) {
  /**
   * @param commerce - the generated client; in-process or RPC follows the root runway topology.
   * @param notifications - the generic repository of Notification.
   * @param settings - reads the customer's preferences per call.
   */
  constructor(
    private readonly commerce: CommerceClient,
    private readonly notifications: Repository<Notification>,
    private readonly settings: SettingsReader,
  ) {
    super();
  }

  /** Skips customers who switched `orderUpdates` off; asks commerce (a call) for the line count. */
  async handle(event: Commerce.OrderPaid): Promise<void> {
    const { customerId, orderId, totalMinor, currency } = event;
    const preferences = await this.settings.for(MessagesSettings, { user: customerId });
    if (!preferences.orderUpdates) return;
    const order = await this.commerce.order.get.call({ orderId });
    const entry = this.notifications.create({
      principalId: customerId,
      kind: NotificationKind.OrderPaid,
      data: { orderId, totalMinor, currency, lines: order.lines.length },
    });
    entry.record(
      NotificationCreated.create({
        notificationId: entry.id,
        principalId: customerId,
        kind: NotificationKind.OrderPaid,
      }),
    );
  }
}
