/**
 * Stackra file contract:
 * Purpose: proves a commerce `orders.order.paid.v1` event adds one inbox entry (one call to
 *          commerce) and one `messages.notification.created.v1`, even when redelivered, and none
 *          for a customer who switched order updates off.
 * Boundary: unit tier; the generated commerce client is faked in the one typed form (ADR 0269), the
 *           event is injected through the memory inbox, settings are faked per user. Commerce's ids
 *           are fixed values: no factory here builds another service's records.
 * Runtime: node
 * Governing contract: ADR 0260 d10 (tests override the client), ADR 0269, ADR 0022
 */
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { deliverRemoteEvent, drainOutbox } from "@stackra/events/testing";
import { actors } from "@stackra/iam/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { describe, expect, it } from "@stackra/testing";
import { Commerce, CommerceClient } from "#stackra/clients";
import { NotificationsModule } from "#src/notifications.module";
import { NotificationCreated } from "#modules/messages/events/notification-created.event";
import { NotifyOnOrderPaidListener } from "#modules/messages/listeners/notify-on-order-paid.listener";
import { MessagesSettings } from "#modules/messages/messages.settings";
import { Notification } from "#modules/messages/models/notification.model";

/** A booted service whose customer has `orderUpdates` as given, and the faked client. */
async function setup(orderUpdates: boolean) {
  const customer = actors.customer();
  const commerce = fakeClient(CommerceClient, (fake) =>
    fake.order.get.returns(({ orderId }) => ({
      id: orderId,
      status: Commerce.OrderStatus.Paid,
      totals: { currency: "USD", subtotalMinor: 2_000, adjustments: [], totalMinor: 2_000 },
      lines: [{ variantId: "var_00000000000000000000000001", quantity: 1, unitPriceMinor: 2_000 }],
      createdAt: new Date("2026-10-21T09:00:00Z"),
    })),
  );
  const app = await createTestingModule(NotificationsModule)
    .useDrivers("memory")
    .override(CommerceClient, commerce)
    .override(SettingsReader, fakeSettings([[MessagesSettings, { orderUpdates }]]))
    .compile();
  // commerce's ids: this service has no factory for another service's records
  const paid = {
    orderId: "ord_00000000000000000000000001",
    customerId: customer.id,
    paymentId: "pay_00000000000000000000000001",
    totalMinor: 2_000,
    currency: "USD",
  };
  return { app, commerce, paid };
}

/** Guards the inbox on payment, where redelivery must not add duplicates. */
describe(NotifyOnOrderPaidListener, () => {
  /** The event is delivered twice with the same id; the inbox dedups, so one call, one entry. */
  it("adds one inbox entry per paid order", async () => {
    const { app, commerce, paid } = await setup(true);

    await deliverRemoteEvent(Commerce.OrderPaid, paid, { id: "evt_1" });
    await deliverRemoteEvent(Commerce.OrderPaid, paid, { id: "evt_1" }); // redelivery
    await drainOutbox();

    expect(commerce.called(commerce.order.get)).toHaveLength(1);
    const rows = await app.repository(Notification).find({ principalId: paid.customerId });
    expect(rows.map((entry) => entry.data.lines)).toEqual([1]);
    expect(app.events.published().ofType(NotificationCreated)).toHaveLength(1);
  });

  /** A customer who switched order updates off gets no entry and costs no call. */
  it("respects the customer's preference", async () => {
    const { app, commerce, paid } = await setup(false);

    await deliverRemoteEvent(Commerce.OrderPaid, paid, { id: "evt_2" });
    await drainOutbox();

    expect(commerce.called(commerce.order.get)).toHaveLength(0);
    expect(await app.repository(Notification).count({ principalId: paid.customerId })).toBe(0);
  });
});
