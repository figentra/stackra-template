/**
 * Stackra file contract:
 * Purpose: proves the inbox badges the service's inbox-wide unread count (not the page's), renders
 *          an entry from its kind's label, marks one read through the generated action, loads the
 *          next page by cursor, says so when marking read fails, and shows the empty state for a
 *          user with none.
 * Boundary: unit tier, jsdom; the notifications client is faked at the HTTP boundary.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import {
  InboxMessageKind,
  ListInboxMessagesQuery,
  MarkInboxMessageReadAction,
} from "#stackra/clients/notifications";
import { NotificationInbox } from "#src/components/notification-inbox";

/** One unread notification as the service returns it: a kind and the data its label uses. */
const UNREAD = {
  id: "inm_01J9Z3K4M5N6P7Q8R9S0T1V2W3",
  kind: InboxMessageKind.OrderPaid,
  data: { orderId: "ord_01J9Z3K4M5N6P7Q8R9S0T1V2W3", totalMinor: 2_000, currency: "USD", lines: 1 },
  readAt: null,
  createdAt: "2026-10-21T08:00:00Z",
};

/** Guards the in-app inbox fed by the notifications service. */
describe(NotificationInbox, () => {
  /** The trigger says the service's unread count, and marking one read must call the action. */
  it("shows the service's unread count and marks one read", async () => {
    const page = { items: [UNREAD], hasMore: true, nextCursor: UNREAD.id, unread: 3 };
    const notifications = fakeClient((fake) => {
      fake.on(ListInboxMessagesQuery).returns(page);
      fake.on(MarkInboxMessageReadAction).returns({ ...UNREAD, readAt: "2026-10-21T08:01:00Z" });
    });
    render(<NotificationInbox />, { locale: "en", clients: [notifications] });
    await userEvent.click(await screen.findByRole("button", { name: "Notifications: 3 unread" }));
    expect(screen.getByText("Order ord_01J9Z3K4M5N6P7Q8R9S0T1V2W3 is paid (1 item)")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Mark read" }));
    expect(notifications.called(MarkInboxMessageReadAction)).toEqual([
      { inboxMessageId: UNREAD.id },
    ]);
  });

  /** Older notifications are one press away: the next page is asked for with the last cursor. */
  it("loads the next page with the cursor", async () => {
    const older = { ...UNREAD, id: "inm_01J9Z3K4M5N6P7Q8R9S0T1V2W4" };
    const notifications = fakeClient((fake) =>
      fake
        .on(ListInboxMessagesQuery)
        .when({ cursor: UNREAD.id })
        .returns({ items: [older], hasMore: false, unread: 3 })
        .otherwise({ items: [UNREAD], hasMore: true, nextCursor: UNREAD.id, unread: 3 }),
    );
    render(<NotificationInbox />, { locale: "en", clients: [notifications] });
    await userEvent.click(await screen.findByRole("button", { name: "Notifications: 3 unread" }));
    await userEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findAllByRole("button", { name: "Mark read" })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  /** A refused mark-read must be said, not swallowed, and the entry stays unread. */
  it("shows a toast when marking read fails", async () => {
    const page = { items: [UNREAD], hasMore: false, unread: 1 };
    const notifications = fakeClient((fake) => {
      fake.on(ListInboxMessagesQuery).returns(page);
      fake.on(MarkInboxMessageReadAction).throws(new Error("network"));
    });
    render(<NotificationInbox />, { locale: "en", clients: [notifications] });
    await userEvent.click(await screen.findByRole("button", { name: "Notifications: 1 unread" }));
    await userEvent.click(screen.getByRole("button", { name: "Mark read" }));
    expect(
      await screen.findByText("Could not mark the notification read. Try again."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mark read" })).toBeTruthy();
  });

  /** A user with no notifications sees the translated empty state, not a blank sheet. */
  it("shows the empty state in Arabic for a user with none", async () => {
    const notifications = fakeClient((fake) =>
      fake.on(ListInboxMessagesQuery).returns({ items: [], hasMore: false, unread: 0 }),
    );
    render(<NotificationInbox />, { locale: "ar", clients: [notifications] });
    await userEvent.click(await screen.findByRole("button", { name: /الإشعارات/ }));
    expect(screen.getByText("لا إشعارات بعد")).toBeTruthy();
  });
});
