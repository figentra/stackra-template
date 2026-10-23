/**
 * Stackra file contract:
 * Purpose: the dashboard page, bound to `DashboardRoute` by name: the KPI row from today's stats,
 *          kept live by the `OrderPaid` broadcast, then the panel's `Dashboard` with every declared
 *          widget in its slot (overridable by a tenant document).
 * Boundary: a function component typed `RouteComponent<typeof DashboardRoute>`; the route's loader
 *           warmed the query, so `useQuery` reads a warm cache entry the broadcast can refetch. The
 *           route is imported as a type only, so there is no runtime cycle.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0164, ADR 0225 (broadcast)
 */
import { KPI } from "@stackra-pro/ui";
import { useQuery } from "@stackra/clients/react";
import { useMoney, useNumber, useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { Dashboard as PanelDashboard } from "@stackra/panel/react";
import { useSubscription } from "@stackra/realtime/react";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Panels } from "#stackra/panels";
import { Slots } from "#stackra/slots";
import { ErrorState } from "#src/components/error-state";
import { LoadingState } from "#src/components/loading-state";
import type { DashboardRoute } from "#src/routes/dashboard/dashboard.route";

/**
 * A paid order anywhere in the tenant refetches today's numbers, so the KPI row never needs a
 * reload.
 */
export const Dashboard: RouteComponent<typeof DashboardRoute> = () => {
  const { t } = useTranslation();
  const money = useMoney();
  const number = useNumber();
  const stats = useQuery(Commerce.queries.OrdersToday, {});
  useSubscription(Commerce.events.OrderPaid, () => stats.refetch());

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">{t(I18n.console.pages.dashboard)}</h1>
      {stats.isPending && <LoadingState label={I18n.console.dashboard.loading} rows={2} />}
      {stats.error && <ErrorState error={stats.error} onRetry={() => stats.refetch()} />}
      {stats.data && (
        <section aria-label={t(I18n.console.dashboard.today)} className="grid gap-4 sm:grid-cols-2">
          <KPI>
            <KPI.Header>
              <KPI.Title>{t(I18n.console.dashboard.orders_today)}</KPI.Title>
            </KPI.Header>
            <KPI.Value>{number(stats.data.count)}</KPI.Value>
          </KPI>
          <KPI>
            <KPI.Header>
              <KPI.Title>{t(I18n.orders.widgets.revenue_today.title)}</KPI.Title>
            </KPI.Header>
            <KPI.Value>{money(stats.data.revenueMinor, stats.data.currency)}</KPI.Value>
            <KPI.Chart
              data={stats.data.hourly.map((value, hour) => ({ hour, value }))}
              dataKey="value"
              aria-hidden
            />
          </KPI>
        </section>
      )}
      <PanelDashboard
        panel={Panels.TenantAdmin}
        slots={[Slots.Dashboard.Header, Slots.Dashboard.Main]}
        overridable
      />
    </div>
  );
};
