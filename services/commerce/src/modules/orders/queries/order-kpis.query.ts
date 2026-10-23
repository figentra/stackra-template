/**
 * Stackra file contract:
 * Purpose: `orders.order.kpis@1`: paid revenue and paid orders for a period, each against the
 *          comparison period, with a per-bucket series and the tenant's revenue target.
 * Boundary: read only. The numbers are computed here, never in a widget: `CrudService.metrics()`
 *           runs one statement per aggregate (current and comparison periods as two filtered
 *           aggregates, buckets from `date_trunc` in the tenant's time zone, empty buckets
 *           zero-filled) over `paid_at`, which `idx_orders_tenant_id_status_paid_at` covers. The
 *           `cache` surface keys a result per principal and input for five minutes and drops it
 *           when an order is paid; OrderKpisWidget's live refresh is derived from that same
 *           `invalidateOn`, so nothing lists the event twice. Surfaces by default:
 *           `GET /orders/kpis` and, as an L0 query, the MCP tool `orders_order_kpis` ("how are
 *           sales doing"); `intent: true` adds the palette phrases in `orders.json`. The permission
 *           is derived (`OrderPermissions.read`).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 4, 16, 21 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0137 (cache option), ADR 0164 (as amended for v3.1),
 *                     ADR 0213
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";
import { Aggregate } from "@stackra/database";
import { CountMetric, MoneyMetric } from "@stackra/panel";
import type { SettingsReader } from "@stackra/settings";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import { OrdersSettings } from "#modules/orders/orders.settings";
import type { OrderKpisInput } from "#modules/orders/schemas/order-kpis-input.schema";
import { OrderKpisOutput } from "#modules/orders/schemas/order-kpis-output.schema";
import type { OrderService } from "#modules/orders/services/order.service";

/** The query behind OrderKpisWidget and the Sales overview dashboard's KPI band. */
export class OrderKpisQuery extends Query({
  key: "order.kpis",
  actors: [ActorKind.User, ActorKind.Agent],
  intent: true,
  cache: {
    ttl: "5m",
    invalidateOn: [OrderPaid],
  },
}) {
  /**
   * @param orders - `metrics()` aggregates paid orders over the period.
   * @param settings - the daily revenue target, resolved for the request's tenant.
   */
  constructor(
    private readonly orders: OrderService,
    private readonly settings: SettingsReader,
  ) {
    super();
  }

  /**
   * An order counts in the period its payment was captured in, whatever its status later.
   * shortcut: sums `total.minor` in the tenant's one selling currency (the metrics reader refuses
   * a mixed sum with `mixed_currency`); add a reporting-currency snapshot to Order when a tenant
   * sells in more than one currency.
   */
  async handle(input: OrderKpisInput, ctx: QueryContext): Promise<OrderKpisOutput> {
    const period = ctx.period(input);
    const paid = this.orders.metrics(period, {
      on: "paidAt",
      where: { status: OrderStatus.Paid },
    });
    const [revenue, count, revenueSeries, countSeries, settings] = await Promise.all([
      paid.sum("total.minor"),
      paid.count(),
      paid.series(Aggregate.Sum, "total.minor"),
      paid.series(Aggregate.Count),
      this.settings.get(OrdersSettings),
    ]);
    const { dailyRevenueTargetMinor } = settings;
    return OrderKpisOutput.create({
      revenue: MoneyMetric.from(revenue, {
        currency: ctx.currency,
        series: revenueSeries.current,
        target: dailyRevenueTargetMinor === null ? null : dailyRevenueTargetMinor * period.days,
      }),
      orders: CountMetric.from(count, { series: countSeries.current }),
    });
  }
}
