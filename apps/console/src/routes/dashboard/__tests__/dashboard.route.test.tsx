/**
 * Stackra file contract:
 * Purpose: proves the dashboard renders today's stats in Arabic with the order currency, refetches
 *          them when an `OrderPaid` broadcast arrives, and shows the contributed low-stock widget
 *          in its slot.
 * Boundary: unit tier, jsdom; `renderRoute` runs the layout's loader, the route's loader and the
 *           page under the testing providers; widgets come from the committed `#stackra/resources`
 *           sample, data from the fake client, the broadcast from the realtime fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0164, ADR 0225, ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, renderRoute, screen } from "@stackra/testing/react";
import { Commerce } from "#stackra/clients";
import { DashboardRoute } from "#src/routes/dashboard/dashboard.route";
import { Routes } from "#stackra/routes";

/** Today's numbers for the fake: 7 orders, 50 000 halalas (500.00 SAR). */
const TODAY = { count: 7, revenueMinor: 50_000, currency: "SAR", hourly: Array(24).fill(1) };

/** Guards the dashboard that combines its own KPIs with widgets contributed by modules. */
describe(DashboardRoute, () => {
  /** KPIs and contributed widgets must render, localised, from the warm query. */
  it("shows the KPIs and the contributed widgets", async () => {
    const commerce = fakeClient(Commerce, (fake) => {
      fake.queries.OrdersToday.returns(TODAY);
      fake.queries.ListLowStock.returns({
        items: [{ variantId: "var_01JA0000000000000000000002", available: 0 }],
      });
    });
    const permissions = ["orders.order.read", "inventory.stock.read"];
    renderRoute(Routes.dashboard, { locale: "ar", clients: [commerce], session: { permissions } });
    // Latin digits in Arabic text: i18n.config.ts `numerals` (the tenant may switch them)
    expect(await screen.findByText(/500\.00\sر\.س\./)).toBeTruthy();
    expect(await screen.findByRole("region", { name: "مخزون منخفض" })).toBeTruthy();
  });

  /** A paid order elsewhere in the tenant must update the KPI row without a reload. */
  it("refetches today's stats when an order is paid", async () => {
    const commerce = fakeClient(Commerce, (fake) => fake.queries.OrdersToday.returns(TODAY));
    const { realtime } = renderRoute(Routes.dashboard, {
      locale: "en",
      clients: [commerce],
      session: { permissions: ["orders.order.read"] },
    });
    await screen.findByText("7");
    await act(() =>
      realtime.emit(Commerce.events.OrderPaid, { orderId: "ord_01JA0000000000000000000003" }),
    );
    expect(commerce.called(Commerce.queries.OrdersToday)).toHaveLength(2);
  });
});
