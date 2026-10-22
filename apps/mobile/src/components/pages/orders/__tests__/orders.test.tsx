/**
 * Stackra file contract:
 * Purpose: the list shows the empty state, renders a page from the faked client, and refetches when
 *          the realtime connection reports a paid order.
 * Boundary: unit tier; the generated client is faked at the HTTP boundary; the realtime fake emits
 *           the event.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0225
 */
import { fakeClient } from "@stackra/clients/testing";
import { fakeRealtime } from "@stackra/realtime/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, renderRoute, screen } from "@stackra/testing/native";
import { Commerce, OrderStatus } from "#stackra/clients";
import { Routes } from "#stackra/routes";

const order = {
  id: "ord_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  status: OrderStatus.PendingPayment.value,
  totals: { currency: "USD", subtotalMinor: 100, totalMinor: 100, adjustments: [] },
  lines: [],
  createdAt: "2026-10-21T09:00:00Z",
};
const base = { locale: "en", permissions: [Commerce.permissions.Order.read] } as const;

/** The list page. */
describe("OrdersPage", () => {
  /** An empty first page renders the empty state with its hint. */
  it("renders the empty state when the first page is empty", async () => {
    const commerce = fakeClient(Commerce, (fake) =>
      fake.queries.ListOrders.returns({ items: [], hasMore: false }),
    );
    renderRoute(Routes.orders, { ...base, clients: [commerce] });
    expect(await screen.findByText("No orders yet")).toBeTruthy();
  });

  /**
   * A paid order changes a row, so the list refetches on the event instead of waiting for focus.
   */
  it("refetches when an order is paid", async () => {
    const commerce = fakeClient(Commerce, (fake) =>
      fake.queries.ListOrders.returns({ items: [order], hasMore: false }),
    );
    const realtime = fakeRealtime();
    renderRoute(Routes.orders, { ...base, clients: [commerce], realtime });
    expect(await screen.findByTestId(`order-${order.id}`)).toBeTruthy();
    await act(() =>
      realtime.emit(Commerce.events.OrderPaid, {
        orderId: order.id,
        customerId: "usr_01H2J3K4L5M6N7P8Q9R0ABCDEF",
        paymentId: "pay_01H2J3K4L5M6N7P8Q9R0ABCDEF",
        totalMinor: order.totals.totalMinor,
        currency: order.totals.currency,
      }),
    );
    expect(commerce.called(Commerce.queries.ListOrders)).toHaveLength(2);
  });
});
