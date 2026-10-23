/**
 * Stackra file contract:
 * Purpose: the route's loader reads the order by its validated param; the page renders lines and
 *          totals, offers cancel only while awaiting payment, and the cancel reaches the client
 *          after the declared confirmation.
 * Boundary: unit tier; the client fake answers the loader's query and records the cancel;
 *           `renderRoute` auto-accepts declared confirmations.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0082, ADR 0139
 */
import type { QueryOutput } from "@stackra/clients";
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/native";
import { Commerce, OrderStatus } from "#stackra/clients";
import { Routes } from "#stackra/routes";

const pending: QueryOutput<typeof Commerce.queries.GetOrder> = {
  id: "ord_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  status: OrderStatus.PendingPayment,
  totals: {
    currency: "SAR",
    subtotalMinor: 5000,
    totalMinor: 4500,
    adjustments: [{ code: "loyalty", label: "Loyalty", amountMinor: -500 }],
  },
  lines: [{ variantId: "var_01H2J3K4L5M6N7P8Q9R0ABCDEF", quantity: 2, unitPriceMinor: 2500 }],
  createdAt: new Date("2026-10-21T09:00:00Z"),
};
const base = {
  params: { orderId: pending.id },
  permissions: [Commerce.permissions.Order.read, Commerce.permissions.Order.cancel],
} as const;

/** The detail page over its route. */
describe("OrderDetail", () => {
  /** The loader asks for exactly the param's order; cancel runs after the confirmation. */
  it("cancels through the client after the declared confirmation", async () => {
    const commerce = fakeClient(Commerce, (fake) => {
      fake.queries.GetOrder.returns(pending);
      fake.actions.CancelOrder.returns({ orderId: pending.id, status: OrderStatus.Cancelled });
    });
    renderRoute(Routes.order_detail, {
      ...base,
      locale: "en",
      clients: [commerce],
      confirm: "accept",
    });
    expect(await screen.findByText("Total: SAR 45.00")).toBeTruthy();
    expect(commerce.called(Commerce.queries.GetOrder)[0]).toEqual({ orderId: pending.id });
    await userEvent.press(screen.getByTestId("order-cancel"));
    expect(commerce.called(Commerce.actions.CancelOrder)).toEqual([{ orderId: pending.id }]);
  });

  /** A paid order has no cancel; the status label comes from the orders namespace in Arabic. */
  it("hides cancel for a paid order", async () => {
    const commerce = fakeClient(Commerce, (fake) =>
      fake.queries.GetOrder.returns({ ...pending, status: OrderStatus.Paid }),
    );
    renderRoute(Routes.order_detail, { ...base, locale: "ar", clients: [commerce] });
    expect(await screen.findByText("مدفوع")).toBeTruthy();
    expect(screen.queryByTestId("order-cancel")).toBeNull();
  });

  /** `OrderDetailParams` refuses a non-prefixed id before the loader runs. */
  it("refuses a malformed id before loading", async () => {
    const commerce = fakeClient(Commerce);
    renderRoute(Routes.order_detail, { ...base, params: { orderId: "123" }, clients: [commerce] });
    expect(commerce.called(Commerce.queries.GetOrder)).toEqual([]);
  });
});
