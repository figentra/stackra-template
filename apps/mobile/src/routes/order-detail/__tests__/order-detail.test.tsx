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
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/native";
import {
  CancelOrderAction,
  GetOrderQuery,
  OrderPermissions,
  OrderStatus,
  type OrderView,
} from "#stackra/clients/commerce";
import { Routes } from "#stackra/routes";

const pending: OrderView = {
  id: "ord_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  status: OrderStatus.PendingPayment,
  customerId: "usr_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  totals: {
    currency: "SAR",
    subtotalMinor: 5000,
    totalMinor: 4500,
    adjustments: [{ code: "loyalty", label: "Loyalty", amountMinor: -500 }],
  },
  lines: [{ variantId: "var_01H2J3K4L5M6N7P8Q9R0ABCDEF", quantity: 2, unitPriceMinor: 2500 }],
  createdAt: new Date("2026-10-21T09:00:00Z"),
  paidAt: null,
};
const base = {
  params: { orderId: pending.id },
  permissions: [OrderPermissions.read, OrderPermissions.cancel],
} as const;

/** The detail page over its route. */
describe("OrderDetail", () => {
  /** The loader asks for exactly the param's order; cancel runs after the confirmation. */
  it("cancels through the client after the declared confirmation", async () => {
    const commerce = fakeClient((fake) => {
      fake.on(GetOrderQuery).returns(pending);
      fake.on(CancelOrderAction).returns({ orderId: pending.id, status: OrderStatus.Cancelled });
    });
    renderRoute(Routes.order_detail, {
      ...base,
      locale: "en",
      clients: [commerce],
      confirm: "accept",
    });
    expect(await screen.findByText("Total: SAR 45.00")).toBeTruthy();
    expect(commerce.called(GetOrderQuery)[0]).toEqual({ orderId: pending.id });
    await userEvent.press(screen.getByTestId("order-cancel"));
    expect(commerce.called(CancelOrderAction)).toEqual([{ orderId: pending.id }]);
  });

  /** A paid order has no cancel; the status label comes from the orders namespace in Arabic. */
  it("hides cancel for a paid order", async () => {
    const commerce = fakeClient((fake) =>
      fake.on(GetOrderQuery).returns({
        ...pending,
        status: OrderStatus.Paid,
        paidAt: new Date("2026-10-21T09:05:00Z"),
      }),
    );
    renderRoute(Routes.order_detail, { ...base, locale: "ar", clients: [commerce] });
    expect(await screen.findByText("مدفوع")).toBeTruthy();
    expect(screen.queryByTestId("order-cancel")).toBeNull();
  });

  /** `OrderDetailParams` refuses a non-prefixed id before the loader runs. */
  it("refuses a malformed id before loading", async () => {
    const commerce = fakeClient();
    renderRoute(Routes.order_detail, { ...base, params: { orderId: "123" }, clients: [commerce] });
    expect(commerce.called(GetOrderQuery)).toEqual([]);
  });
});
