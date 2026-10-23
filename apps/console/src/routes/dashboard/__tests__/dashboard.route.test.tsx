/**
 * Stackra file contract:
 * Purpose: proves the dashboard renders today's revenue and order metrics in Arabic with the order
 *          currency and the change against yesterday, refetches them when an `OrderPaid` broadcast
 *          arrives (the query's `cache.invalidateOn`), and shows the contributed low-stock widget
 *          in the main grid.
 * Boundary: unit tier, jsdom; `renderRoute` runs the layout's loader, the route's loader and the
 *           page under the testing providers; widgets come from the committed `#stackra/resources`
 *           sample, data from the fake client, the broadcast from the realtime fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0164, ADR 0225
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, renderRoute, screen } from "@stackra/testing/react";
import { ListLowStockQuery, OrderKpisQuery, OrderPaid } from "#stackra/clients/commerce";
import { DashboardRoute } from "#src/routes/dashboard/dashboard.route";
import { Routes } from "#stackra/routes";

/** Today: 500.00 SAR from 7 orders, against 400.00 SAR from 7 orders yesterday. */
const KPIS = {
  revenue: {
    value: 50_000,
    previous: 40_000,
    series: Array(24).fill(2_000),
    target: null,
    currency: "SAR",
  },
  orders: { value: 7, previous: 7, series: null, target: null },
};

/** Guards the dashboard that combines its own KPIs with widgets contributed by modules. */
describe(DashboardRoute, () => {
  /** KPIs and contributed widgets must render, localised, from the warm query. */
  it("shows the KPIs with their change and the contributed widgets", async () => {
    const commerce = fakeClient((fake) => {
      fake.on(OrderKpisQuery).returns(KPIS);
      fake.on(ListLowStockQuery).returns({
        items: [{ variantId: "var_01JA0000000000000000000002", available: 0 }],
      });
    });
    const permissions = ["orders.order.read", "inventory.stock.read"];
    renderRoute(Routes.dashboard, { locale: "ar", clients: [commerce], session: { permissions } });
    // Latin digits in Arabic text: i18n.config.ts `numerals` (the tenant may switch them)
    expect(await screen.findByText(/500\.00\sر\.س\./)).toBeTruthy();
    expect(screen.getByText(/\+25%/)).toBeTruthy();
    expect(await screen.findByRole("region", { name: "مخزون منخفض" })).toBeTruthy();
  });

  /** The ar-SA overlay changes the tax note; every other string falls back to `ar`. */
  it("shows the Saudi tax note through the regional overlay", async () => {
    const commerce = fakeClient((fake) => fake.on(OrderKpisQuery).returns(KPIS));
    renderRoute(Routes.dashboard, {
      locale: "ar-SA",
      clients: [commerce],
      session: { permissions: ["orders.order.read"] },
    });
    expect(await screen.findByText(/كما تظهر في الفواتير الإلكترونية/)).toBeTruthy();
    expect(screen.getByText("إيرادات اليوم")).toBeTruthy();
  });

  /** A paid order elsewhere in the tenant must update the KPI row without a reload. */
  it("refetches today's KPIs when an order is paid", async () => {
    const commerce = fakeClient((fake) => fake.on(OrderKpisQuery).returns(KPIS));
    const { realtime } = renderRoute(Routes.dashboard, {
      locale: "en",
      clients: [commerce],
      session: { permissions: ["orders.order.read"] },
    });
    await screen.findByText("7");
    await act(() => realtime.emit(OrderPaid, { orderId: "ord_01JA0000000000000000000003" }));
    expect(commerce.called(OrderKpisQuery)).toHaveLength(2);
  });
});
