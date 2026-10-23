/**
 * Stackra file contract:
 * Purpose: proves marking read stamps one's own entry once, and that another principal's entry is
 *          a not-found refusal.
 * Boundary: unit tier through the pipeline, memory drivers, rows from the factory, clock frozen.
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0140, ADR 0022
 */
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { Refusals } from "#stackra/manifest";
import { NotificationsModule } from "#src/notifications.module";
import { MarkNotificationReadAction } from "#modules/messages/actions/mark-notification-read.action";
import { NotificationFactory } from "#modules/messages/database/factories/notification.factory";
import { Notification } from "#modules/messages/models/notification.model";

/** Guards the inbox, where one customer must never touch another's entries. */
describe(MarkNotificationReadAction, () => {
  /** Twice on my unread entry: the first `readAt` stays (an idempotent PUT). */
  it("marks the actor's own entry read once", async () => {
    await createTestingModule(NotificationsModule).useDrivers("memory").compile();
    const entry = await NotificationFactory.new().create();
    const me = actors.customer(entry.principalId);

    freezeClock("2026-10-21T09:00:00Z");
    const first = await run(MarkNotificationReadAction, { notificationId: entry.id }, { as: me });
    freezeClock("2026-10-21T10:00:00Z");
    const again = await run(MarkNotificationReadAction, { notificationId: entry.id }, { as: me });

    expect(first.output.readAt).toEqual(new Date("2026-10-21T09:00:00Z"));
    expect(again.output.readAt).toEqual(first.output.readAt);
  });

  /** Someone else's entry is refused as not found, and stays unread. */
  it("refuses another principal's entry as not found", async () => {
    const app = await createTestingModule(NotificationsModule).useDrivers("memory").compile();
    const entry = await NotificationFactory.new().create();

    const result = await run(
      MarkNotificationReadAction,
      { notificationId: entry.id },
      { as: actors.customer() },
    );

    expect(result).toRefuseWith(refusal(Refusals.messages.notification_not_found));
    const [row] = await app.repository(Notification).find({ id: entry.id });
    expect(row?.readAt).toBeNull();
  });
});
