/**
 * Stackra file contract:
 * Purpose: `/`: the home screen: today's numbers the app owns, then every widget the consumed
 *          services contributed, laid out by the panel's slots and the tenant's published document
 *          when one exists. Its page is `dashboard.tsx` beside it, bound by name.
 * Boundary: the options are the declaration; the loader warms today's stats, and its permission
 *           (`orders.order.read`) is derived from that query. `staleTime` is how long the warmed
 *           answer counts as fresh. Its path equals the shell's, so it is the index; it shadows the
 *           panel's generated index route on purpose (gen reports it in the route tree). The title
 *           reuses the dashboard heading's key, which the tab and the breadcrumb show too.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decision 12: tab items from
 *                     routes), ADR 0164 (widgets declared by modules), ADR 0110 (tenant override)
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/** Route `/`: today's numbers plus every widget the consumed services contribute; tab one. */
export class DashboardRoute extends Route({
  path: "/",
  layout: ShellLayout,
  title: I18n.console.pages.dashboard,
  tab: {
    order: 1,
    icon: Icons.House,
  },
}) {
  /** Warms today's stats; the page reads the same cache entry, which the broadcast refreshes. */
  override async loader(ctx: RouteContext<this>) {
    return { today: await ctx.query(Commerce.queries.OrdersToday, {}, { staleTime: "30s" }) };
  }
}
