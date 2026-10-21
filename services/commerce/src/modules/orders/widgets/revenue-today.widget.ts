/**
 * Stackra file contract:
 * Purpose: a dashboard tile with today's paid orders and an hourly sparkline.
 * Boundary: a declaration, nothing runs at request time. `component` is an override point
 *           (override-points/revenue-sparkline.point.ts), so the service ships no React and gen
 *           checks that an app binds a component to it. Roles are `SystemRole` cases (ADR 0208).
 * Runtime: node
 * Governing contract: ADR 0164, ADR 0266 (phase 5: `refreshOn`),
 *                     guides/programming-model.mdx#widgets
 */
import { SystemRole } from "@stackra/iam";
import { Widget } from "@stackra/panel";
import { Slots } from "#stackra/slots";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { OrdersTodayQuery } from "#modules/orders/queries/orders-today.query";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { RevenueSparkline } from "#modules/orders/override-points/revenue-sparkline.point";

/**
 * Bound to the query by class (its output types the component's props); refreshed over realtime
 * when an order is paid.
 */
@Widget({
  title: I18n.orders.widgets.revenue_today,
  realms: [Realm.TenantAdmin],
  slot: Slots.Dashboard.Header,
  size: "sm",
  query: OrdersTodayQuery,
  component: RevenueSparkline,
  permission: OrderPermissions.read,
  roles: [SystemRole.Owner, SystemRole.Manager],
  refreshOn: [OrderPaid],
})
export class RevenueTodayWidget {}
