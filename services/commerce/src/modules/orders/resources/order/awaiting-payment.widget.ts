/**
 * Stackra file contract:
 * Purpose: a tile of the ten newest orders still awaiting payment, with Cancel on each row and
 *          "Open all" to the orders list.
 * Boundary: a declaration; the query is the type argument (`Widget<ListOrdersQuery>`), and because
 *           ListOrdersQuery is OrderResource's list query the View display renders that resource's
 *           `awaiting_payment` view: its columns, its filter and its row actions (Cancel, with the
 *           policy per order), so nothing is restated here. It has no `slot`: only the Sales
 *           overview dashboard places it, and the widget library offers it to anyone who may read
 *           orders. ListOrdersQuery is uncached, so the refresh is written here: on the broadcast
 *           `order.paid` (a paid order leaves the view) and every minute for orders placed or
 *           cancelled, whose events do not broadcast. The key (`orders.awaiting_payment`) and
 *           labels are derived; the permission is the query's.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1)
 */
import { type Display, Widget, WidgetSize } from "@stackra/panel";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import type { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";
import type { ListOrdersOutput } from "#modules/orders/schemas/list-orders-output.schema";

/** Full width under the KPI band; at most ten rows, then "Open all". */
export class AwaitingPaymentWidget extends Widget<ListOrdersQuery>({
  size: WidgetSize.Full,
  refreshOn: [OrderPaid],
  refreshEvery: "60s",
}) {
  /** OrderResource's `awaiting_payment` view as a tile. */
  display(d: Display<ListOrdersOutput>) {
    return d.view("awaiting_payment").limit(10);
  }
}
