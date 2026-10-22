/**
 * Stackra file contract:
 * Purpose: when commerce reports a paid order, add an entry to the customer's in-app inbox. The
 *          consumer side of a cross-service event, plus a call for the line count.
 * Boundary: `@OnEvent(Commerce.events.OrderPaid)` takes the descriptor gen built from commerce's
 *           committed manifest; `CommerceClient` is injected by class. Nothing here imports
 *           commerce code. Runs once per event id. Honours the user's NotificationPreferences
 *           (`orderUpdates`). Records `notification.created`, broadcast to the customer's sessions.
 * Runtime: node
 * Governing contract: ADR 0260 d3, d4 (client by constructor; call and event modes), ADR 0078, ADR
 *                     0127
 */
import { type EventOf, OnEvent } from "@stackra/events";
import type { Repository } from "@stackra/database";
import type { SettingsReader } from "@stackra/settings";
import type { CommerceClient } from "#stackra/clients";
import { Commerce } from "#stackra/clients";
import { Queues } from "#stackra/queues";
import type { Notification } from "#modules/messages/models/notification.model";
import { NotificationKind } from "#modules/messages/enums/notification-kind.enum";
import { NotificationCreated } from "#modules/messages/events/notification-created.event";
import { NotificationPreferences } from "#modules/messages/settings/notification-preferences.setting";

/** Queued on `Queues.Inbox` so a slow commerce call never blocks the event inbox. */
export class NotifyOnOrderPaidListener {
  /** @param commerce - the generated client; transport (in-process or RPC) follows runway.yaml. */
  constructor(
    private readonly commerce: CommerceClient,
    private readonly notifications: Repository<Notification>,
    private readonly settings: SettingsReader,
  ) {}

  /** Skips customers who switched `orderUpdates` off; asks commerce (call) for the line count. */
  @OnEvent(Commerce.events.OrderPaid, { queue: Queues.Inbox })
  async handle(event: EventOf<typeof Commerce.events.OrderPaid>): Promise<void> {
    const { customerId, orderId, totalMinor, currency } = event.data;
    const prefs = await this.settings.for(NotificationPreferences, { user: customerId });
    if (!prefs.orderUpdates) return;
    const order = await this.commerce.order.get.call({ orderId });
    const entry = this.notifications.create({
      principalId: customerId,
      kind: NotificationKind.OrderPaid,
      data: { orderId, totalMinor, currency, lines: order.lines.length },
      readAt: null,
    });
    entry.record(
      new NotificationCreated({
        notificationId: entry.id,
        principalId: customerId,
        kind: NotificationKind.OrderPaid,
      }),
    );
  }
}
