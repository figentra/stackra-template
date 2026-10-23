/**
 * Stackra file contract:
 * Purpose: the sales band at the top of the admin home dashboard: paid revenue against the tenant's
 *          target and paid orders, each with its trend against the previous period and a sparkline.
 * Boundary: a declaration; gen runs `display` once and records the tree in the manifest. The query
 *           is the type argument (`Widget<OrderKpisQuery>`), so every path is checked against
 *           OrderKpisOutput by TypeScript and again by gen. Format, currency, trend, sparkline and
 *           target come from the metric types; this file only says which way the tones go, the
 *           icons and where a click goes. It sits in the home dashboard's Header slot (a band, so
 *           KPIs only). There is no `refreshOn`: it is derived from the query's
 *           `cache.invalidateOn` (an order paid refetches the band). The key (`orders.order_kpis`)
 *           and labels (`orders::widgets.order_kpis.*`) are derived; the permission is the query's
 *           (`orders.order.read`). Roles shape presentation only (ADR 0273): they decide whose
 *           default dashboard shows it, never who may add it.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1), ADR 0273
 */
import { Tone } from "@stackra/contracts";
import { SystemRole } from "@stackra/iam";
import { Bind, type Display, Drill, TimeRange, Widget } from "@stackra/panel";
import { Slots } from "#stackra/slots";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { OrderKpisQuery } from "#modules/orders/queries/order-kpis.query";
import { OrderResource } from "#modules/orders/resources/order/order.resource";
import type { OrderKpisOutput } from "#modules/orders/schemas/order-kpis-output.schema";

/**
 * Owners and managers see it on their default dashboard; anyone with `orders.order.read` may add
 * it.
 */
export class OrderKpisWidget extends Widget<OrderKpisQuery>({
  slot: Slots.Dashboard.Header,
  order: 10,
  ranges: [TimeRange.Today, TimeRange.Last7Days, TimeRange.Last30Days, TimeRange.ThisMonth],
  range: TimeRange.Today,
  roles: [SystemRole.Owner, SystemRole.Manager],
}) {
  /** Revenue turns amber under the target and red under 80 % of it; both tiles open paid orders. */
  display(d: Display<OrderKpisOutput>) {
    const paidOrders = Drill.resource(OrderResource, {
      filter: {
        status: [OrderStatus.Paid],
        paidAt: Bind.range(),
      },
    });
    return d.kpiGroup([
      d
        .kpi("revenue")
        .icon("banknote")
        .tone((t) => [
          t.belowTarget(0.8, Tone.Danger),
          t.belowTarget(1, Tone.Warning),
          t.aboveTarget(1, Tone.Success),
        ])
        .drill(paidOrders),
      d.kpi("orders").icon("receipt").drill(paidOrders),
    ]);
  }
}
