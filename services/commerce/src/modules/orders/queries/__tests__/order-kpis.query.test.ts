/**
 * Stackra file contract:
 * Purpose: proves `orders.order.kpis@1` counts only orders paid in the period, sums their totals,
 *          compares with the previous period, and scales the tenant's daily revenue target by the
 *          days in the period (none when the target is unset).
 * Boundary: unit tier through the pipeline as a staff actor; memory drivers (the memory database
 *           runs `CrudService.metrics()`), the clock frozen so "today" is exact, orders settings
 *           faked, every order from the factory.
 * Runtime: node
 * Governing contract: ADR 0137 (cache option), ADR 0164 (as amended for v3.1), ADR 0022
 */
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { actors } from "@stackra/iam/testing";
import { Money } from "@stackra/money";
import { TimeRange } from "@stackra/panel";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { CommerceModule } from "#stackra/module";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { OrdersSettings } from "#modules/orders/orders.settings";
import { OrderKpisQuery } from "#modules/orders/queries/order-kpis.query";

/** The factory attributes of an order paid at the given instant. */
const paidAt = (iso: string) => ({ paidAt: new Date(iso) });

/** The factory attributes of an order whose subtotal and total are the given USD minor units. */
const total = (minor: number) => ({
  subtotal: Money.ofMinor(minor, "USD"),
  total: Money.ofMinor(minor, "USD"),
});

/** A tenant whose daily revenue target is as given, with the clock at noon on 21 October. */
async function setup(dailyRevenueTargetMinor: number | null) {
  freezeClock("2026-10-21T12:00:00Z");
  await createTestingModule(CommerceModule)
    .useDrivers("memory")
    .override(SettingsReader, fakeSettings([[OrdersSettings, { dailyRevenueTargetMinor }]]))
    .compile();
  await OrderFactory.new()
    .paid()
    .create({ ...total(2_000), ...paidAt("2026-10-21T09:00:00Z") });
  await OrderFactory.new()
    .paid()
    .create({ ...total(3_000), ...paidAt("2026-10-21T11:00:00Z") });
  await OrderFactory.new()
    .paid()
    .create({ ...total(4_000), ...paidAt("2026-10-20T10:00:00Z") });
  await OrderFactory.new().create(total(9_000)); // pending: never revenue
}

/** Guards the sales band, the first number an owner reads every morning. */
describe(OrderKpisQuery, () => {
  /** Today: two paid orders worth 5 000, yesterday one worth 4 000; the target is one day's. */
  it("reports today's paid revenue and orders against yesterday and the target", async () => {
    await setup(10_000);

    const { output } = await run(
      OrderKpisQuery,
      { range: TimeRange.Today },
      { as: actors.staff() },
    );

    expect(output.revenue).toMatchObject({ value: 5_000, previous: 4_000, target: 10_000 });
    expect(output.revenue.currency).toBe("USD");
    expect(output.orders).toMatchObject({ value: 2, previous: 1, target: null });
  });

  /** Seven days of a 10 000 daily target is 70 000; no target set means none is shown. */
  it("scales the daily target by the days, and leaves it out when unset", async () => {
    await setup(10_000);
    const week = await run(OrderKpisQuery, { range: TimeRange.Last7Days }, { as: actors.staff() });
    expect(week.output.revenue.target).toBe(70_000);

    await setup(null);
    const none = await run(OrderKpisQuery, { range: TimeRange.Today }, { as: actors.staff() });
    expect(none.output.revenue.target).toBeNull();
  });
});
