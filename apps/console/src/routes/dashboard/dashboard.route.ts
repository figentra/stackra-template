/**
 * Stackra file contract:
 * Purpose: `/`: the home screen: today's revenue and order count the app shows as its own KPI row,
 *          then every widget the consumed services placed in the dashboard's main grid, laid out by
 *          the panel and the tenant's published document when one exists. Its page is
 *          `dashboard.tsx` beside it, bound by name.
 * Boundary: the options are the declaration; the loader warms `OrderKpisQuery` for today, and its
 *           permission (`orders.order.read`) is derived from that query. `staleTime` is how long
 *           the warmed answer counts as fresh; the query's `cache.invalidateOn` refreshes it on
 *           every paid order. Its path equals the shell's, so it is the index; it shadows the
 *           panel's generated index route on purpose (gen reports it in the route tree). The title
 *           is the page's own `pages::dashboard.title`, which the tab and the breadcrumb show too.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16; as amended by programming model v3.1,
 *                     AGENTS.md: client classes and icon names), ADR 0295 (decision 12: tab items
 *                     from routes), ADR 0164 (widgets declared by modules), ADR 0110
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { TimeRange } from "@stackra/panel";
import { OrderKpisQuery } from "#stackra/clients/commerce";
import { I18n } from "#stackra/i18n";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/** Route `/`: today's KPIs plus every widget the consumed services contribute; tab one. */
export class DashboardRoute extends Route({
  path: "/",
  layout: ShellLayout,
  title: I18n.pages.dashboard.title,
  tab: {
    order: 1,
    icon: "house",
  },
}) {
  /** Warms today's KPIs; the page reads the same cache entry. */
  override async loader(ctx: RouteContext<this>) {
    const input = { range: TimeRange.Today };
    return { kpis: await ctx.query(OrderKpisQuery, input, { staleTime: "30s" }) };
  }
}
