/**
 * Stackra file contract:
 * Purpose: the inbox renders the service's entries from their kind's label and the unread count
 *          with the right plural form in English and in Arabic, where "few" (3 to 10) and "many"
 *          (11 to 99) are different words.
 * Boundary: unit tier; the notifications client is faked; the Arabic catalogue is the app's real
 *           one.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0192
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen } from "@stackra/testing/native";
import { Notifications } from "#stackra/clients";
import { Routes } from "#stackra/routes";

const entry = {
  id: "ntf_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  kind: Notifications.enums.NotificationKind.OrderPaid,
  data: { orderId: "ord_01H2J3K4L5M6N7P8Q9R0ABCDEF", totalMinor: 2_000, currency: "USD", lines: 2 },
  createdAt: "2026-10-21T09:00:00Z",
  readAt: null,
};
const page = (unread: number) =>
  fakeClient(Notifications, (fake) =>
    fake.queries.ListNotifications.returns({ items: [entry], hasMore: false, unread }),
  );

/** The inbox page over its route. */
describe("InboxPage", () => {
  /** An entry renders as its kind's label with its data; the count is the service's, not the page's. */
  it("renders the entries and the English count", async () => {
    renderRoute(Routes.inbox, { locale: "en", clients: [page(1)] });
    expect(
      await screen.findByText("Order ord_01H2J3K4L5M6N7P8Q9R0ABCDEF is paid (2 items)"),
    ).toBeTruthy();
    expect(screen.getByText("1 unread notification")).toBeTruthy();
  });

  /** Arabic "few" and "many" differ; a missing category would render the wrong word. */
  it.each([
    [0, "لا توجد إشعارات غير مقروءة"],
    [2, "إشعاران غير مقروءين"],
    [3, "3 إشعارات غير مقروءة"],
    [11, "11 إشعارًا غير مقروء"],
    [100, "100 إشعار غير مقروء"],
  ])("renders the Arabic plural for %i", async (unread, text) => {
    renderRoute(Routes.inbox, { locale: "ar", clients: [page(unread)] });
    expect(await screen.findByText(text)).toBeTruthy();
  });
});
