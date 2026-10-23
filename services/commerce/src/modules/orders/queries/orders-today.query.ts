/**
 * Stackra file contract:
 * Purpose: `orders.order.stats_today@1`: count and revenue of today's paid orders in the tenant's
 *          time zone, with revenue per hour so the KPI sparkline needs no second call.
 * Boundary: read only. Cached for one minute per tenant and dropped the moment an order is paid
 *           (`invalidateOn` takes the event class), so the tile is never more than a minute stale.
 *           The path is kept as `/orders/stats/today` instead of the derived `/orders/stats-today`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 4, 16, 21 and 26), ADR 0137 (cache option), ADR 0150
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { CurrencyCode } from "@stackra/money";
import { Int, List, Schema } from "@stackra/validation";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import type { OrderService } from "#modules/orders/services/order.service";

/** No input: "today" and the tenant come from the context. */
export class OrdersTodayInput extends Schema {}

/** Today's paid orders in one currency. */
export class OrdersTodayOutput extends Schema {
  /** How many orders were paid today. */
  @Int
  count!: number;

  /** Their total, in minor units. */
  @Int
  revenueMinor!: number;

  /** ISO 4217 code of the amounts. */
  currency!: CurrencyCode;

  /** Revenue per hour of the tenant's day, in minor units; always 24 entries. */
  @List({
    min: 24,
    max: 24,
  })
  @Int({ each: true })
  hourly!: number[];
}

/** The query behind the revenue-today widget; the console and mobile tiles call it over HTTP. */
export class OrdersTodayQuery extends Query({
  key: "order.stats_today",
  actors: [ActorKind.User],
  cache: {
    ttl: "1m",
    invalidateOn: [OrderPaid],
  },
  endpoint: {
    method: HttpMethod.Get,
    path: "/orders/stats/today",
  },
}) {
  /** @param orders - its `findPaidSince` read supplies today's rows. */
  constructor(private readonly orders: OrderService) {
    super();
  }

  /** Buckets paid orders by the hour they were paid, in the tenant's time zone from the context. */
  async handle(_input: OrdersTodayInput, ctx: QueryContext): Promise<OrdersTodayOutput> {
    const paid = await this.orders.findPaidSince(ctx.startOfDay());
    const hourly = Array.from({ length: 24 }, () => 0);
    for (const order of paid) {
      // findPaidSince returns paid rows only, and every paid row has paidAt
      if (!order.paidAt) continue;
      const hour = ctx.hourOf(order.paidAt);
      hourly[hour] = (hourly[hour] ?? 0) + order.total.minor;
    }
    return OrdersTodayOutput.create({
      count: paid.length,
      revenueMinor: paid.reduce((sum, order) => sum + order.total.minor, 0),
      currency: ctx.currency,
      hourly,
    });
  }
}
