/**
 * Stackra file contract:
 * Purpose: `/`: the home screen: today's numbers the app owns, then every widget the consumed
 *          services contributed, laid out by the panel's slots and the tenant's published document
 *          when one exists.
 * Boundary: options are the declaration gen reads. The route only warms a query, so it uses
 *           `prefetch` and no loader; its permission is derived from that query, and `staleTime`
 *           is how long the warmed answer counts as fresh. Its path equals the shell's, so it is
 *           the index; it shadows the panel's generated index route on purpose (gen reports it in
 *           routes.tsx).
 * Runtime: browser
 * Governing contract: ADR 0164 (widgets declared by modules), ADR 0110 (tenant override), ADR 0165
 */
import { Route } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { DashboardPage } from "#src/components/pages/dashboard";
import { ShellLayout } from "#src/routes/shell.layout";

/**
 * Route `/`: the home screen of today's numbers plus every widget the consumed services contribute.
 */
@Route({
  path: "/",
  layout: ShellLayout,
  tab: { order: 1, icon: Icons.House, label: I18n.console.pages.dashboard },
  prefetch: [Commerce.queries.OrdersToday],
  staleTime: "30s",
  component: DashboardPage,
  title: I18n.console.pages.dashboard,
})
export class DashboardRoute {}
