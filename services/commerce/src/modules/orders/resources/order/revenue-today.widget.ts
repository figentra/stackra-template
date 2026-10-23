/**
 * Stackra file contract:
 * Purpose: a dashboard tile with today's paid revenue and an hourly sparkline.
 * Boundary: a declaration; nothing runs at request time. A widget is a query bound to a display
 *           kind: the built-in Kpi renders the value in its currency and the sparkline, so the
 *           service ships no React and no app must supply a renderer. Display field names are
 *           `keyof` the query's output. The key (`orders.revenue_today`) and the title
 *           (`orders::widgets.revenue_today.title`) are derived, and the permission is the
 *           query's. `refreshOn` sends a data-free refresh to the sessions allowed to see it.
 *           Roles shape presentation only (ADR 0273); they are SystemRole cases (ADR 0208).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0164, ADR 0273
 */
import { SystemRole } from "@stackra/iam";
import { Widget, WidgetDisplay, WidgetSize } from "@stackra/panel";
import { Slots } from "#stackra/slots";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import { OrdersTodayQuery } from "#modules/orders/queries/orders-today.query";

/** Shown to owners and managers in the dashboard header; refreshed when an order is paid. */
export class RevenueTodayWidget extends Widget({
  slot: Slots.Dashboard.Header,
  query: OrdersTodayQuery,
  display: WidgetDisplay.kpi({
    value: "revenueMinor",
    currency: "currency",
    sparkline: "hourly",
  }),
  size: WidgetSize.Small,
  roles: [SystemRole.Owner, SystemRole.Manager],
  refreshOn: [OrderPaid],
}) {}
