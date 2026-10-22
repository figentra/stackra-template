/**
 * Stackra file contract:
 * Purpose: `orders.order.stats_today`: count and revenue of today's paid orders in the tenant's
 *          time zone.
 * Boundary: read only, cached for one minute per tenant and dropped the moment an order is paid
 *           (`invalidateOn` takes the event class, no tag typed by hand), so the tile is never more
 *           than a minute stale and never wrong.
 * Runtime: node
 * Governing contract: ADR 0137 (cache option), 0150, guides/programming-model.mdx#queries
 */
import { Query, type QueryContext } from "@stackra/actions";
import { OrderRepository } from "#modules/orders/repositories/order.repository";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import { OrdersTodayInput } from "#modules/orders/schemas/orders-today-input.schema";
import { OrdersTodayOutput } from "#modules/orders/schemas/orders-today-output.schema";
import { ActorKind } from "@stackra/contracts";

/** The query behind the revenue-today widget. */
@Query({
  key: "order.stats_today",
  input: OrdersTodayInput,
  output: OrdersTodayOutput,
  permission: OrderPermissions.read,
  actors: [ActorKind.User],
  cache: { ttl: "1m", invalidateOn: [OrderPaid] },
})
export class OrdersTodayQuery {
  constructor(private readonly orders: OrderRepository) {}

  /**
   * Buckets paid orders by the hour they were paid, in the tenant's time zone taken from the
   * context.
   */
  async handle(_input: OrdersTodayInput, ctx: QueryContext): Promise<OrdersTodayOutput> {
    const paid = await this.orders.findPaidSince(ctx.startOfDay());
    const hourly = Array.from({ length: 24 }, () => 0);
    // paidAt is set on every Paid row
    for (const o of paid) hourly[ctx.hourOf(o.paidAt!)]! += o.totalMinor;
    return {
      count: paid.length,
      revenueMinor: paid.reduce((s, o) => s + o.totalMinor, 0),
      currency: ctx.currency,
      hourly,
    };
  }
}
