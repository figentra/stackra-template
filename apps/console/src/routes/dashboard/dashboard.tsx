/**
 * Stackra file contract:
 * Purpose: the dashboard page, bound to `DashboardRoute` by name: the KPI row from the `revenue`
 *          and `orders` metrics of today's `OrderKpisQuery` (value, change against yesterday and
 *          the hourly sparkline), the regional note on how revenue counts tax, then the panel's
 *          dashboard grid with every widget placed in `Slots.Dashboard.Main` (overridable by a
 *          tenant document).
 * Boundary: a class component typed by its route (`RouteProps<typeof DashboardRoute>`), so it needs
 *           no props file; gen compiles it to a function component. The route's loader warmed the
 *           query, so `useQuery` reads a warm cache entry; the query's `cache.invalidateOn` (a paid
 *           order) refetches it, so the page subscribes to nothing itself. This row stands in for
 *           the `Slots.Dashboard.Header` band on this one page, where `OrderKpisWidget` would show
 *           the same two metrics; the welcome document places that widget. The route is imported as
 *           a type only, so there is no runtime cycle.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0164, ADR 0225 (broadcast)
 */
import { KPI } from "@stackra-pro/ui";
import { useQuery } from "@stackra/clients/react";
import { useMoney, useNumber, useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { TimeRange } from "@stackra/panel";
import { Dashboard as PanelDashboard } from "@stackra/panel/react";
import { Component, Description } from "@stackra/ui";
import { OrderKpisQuery } from "#stackra/clients/commerce";
import { I18n } from "#stackra/i18n";
import { Panels } from "#stackra/panels";
import { Slots } from "#stackra/slots";
import { ErrorState } from "#src/components/error-state";
import { LoadingState } from "#src/components/loading-state";
import type { DashboardRoute } from "#src/routes/dashboard/dashboard.route";

/** Today's two KPIs, then the contributed widgets. */
export class Dashboard extends Component<RouteProps<typeof DashboardRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Formats minor units of a currency in the user's locale. */
  money = useMoney();

  /** Formats a number or a ratio in the user's locale and numerals. */
  number = useNumber();

  /** Today's KPIs, warm from the loader. */
  kpis = useQuery(OrderKpisQuery, { range: TimeRange.Today });

  /** The change against the previous period as a signed percentage, or null without one. */
  change(value: number | null, previous: number | null) {
    if (value === null || previous === null || previous === 0) return null;
    return this.i18n.t(I18n.pages.dashboard.change, {
      change: this.number((value - previous) / previous, {
        style: "percent",
        maximumFractionDigits: 1,
        signDisplay: "exceptZero",
      }),
    });
  }

  /** The heading, the KPI row or its loading and error states, then the panel's grid. */
  render() {
    const { t } = this.i18n;
    const kpis = this.kpis;
    const revenue = kpis.data?.revenue;
    const orders = kpis.data?.orders;
    return (
      <div className="flex flex-col gap-6">
        <h1 className="sr-only">{t(I18n.pages.dashboard.title)}</h1>
        {kpis.isPending && <LoadingState label={I18n.pages.dashboard.loading} rows={2} />}
        {kpis.error && <ErrorState error={kpis.error} onRetry={() => kpis.refetch()} />}
        {revenue && orders && (
          <section aria-label={t(I18n.pages.dashboard.today)} className="flex flex-col gap-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <KPI>
                <KPI.Header>
                  <KPI.Title>{t(I18n.pages.dashboard.revenue)}</KPI.Title>
                </KPI.Header>
                <KPI.Value>{this.money(revenue.value ?? 0, revenue.currency)}</KPI.Value>
                <KPI.Trend>{this.change(revenue.value, revenue.previous)}</KPI.Trend>
                {revenue.series && (
                  <KPI.Chart
                    data={revenue.series.map((value, hour) => ({ hour, value }))}
                    dataKey="value"
                    aria-hidden
                  />
                )}
              </KPI>
              <KPI>
                <KPI.Header>
                  <KPI.Title>{t(I18n.pages.dashboard.orders)}</KPI.Title>
                </KPI.Header>
                <KPI.Value>{this.number(orders.value ?? 0)}</KPI.Value>
                <KPI.Trend>{this.change(orders.value, orders.previous)}</KPI.Trend>
              </KPI>
            </div>
            <Description>{t(I18n.pages.dashboard.revenue_note)}</Description>
          </section>
        )}
        <PanelDashboard panel={Panels.TenantAdmin} slots={[Slots.Dashboard.Main]} overridable />
      </div>
    );
  }
}
