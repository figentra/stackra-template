/**
 * Stackra file contract:
 * Purpose: `orders.order.list`: the caller's orders, newest first, cursor-paginated, filterable by
 *          status.
 * Boundary: read only, no transaction. Hand-written rather than `@Crud` because the customer realm
 *           is narrowed in the query itself (a per-record policy would page unevenly). L0, so an
 *           MCP tool automatically (ADR 0155).
 * Runtime: node
 * Governing contract: ADR 0098, 0155, http conventions (cursor pagination),
 *                     guides/programming-model.mdx#queries
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod, Realm } from "@stackra/contracts";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { OrderListFilter } from "#modules/orders/schemas/order-list-filter.schema";
import { OrderPage } from "#modules/orders/schemas/order-page.schema";

/** Behind the mobile order history and the console list; customers see only their own rows. */
@Query({
  key: "order.list",
  input: OrderListFilter,
  output: OrderPage,
  permission: OrderPermissions.read,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  intents: ["show my orders", "list recent orders"],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/orders" })
export class ListOrdersQuery {
  constructor(private readonly orders: OrderService) {}

  /** Fetches one row more than `limit` to learn `hasMore` without a count query. */
  async handle(input: OrderListFilter, ctx: QueryContext): Promise<OrderPage> {
    const where = {
      ...(input.status && { status: input.status }),
      ...(ctx.actor.realm === Realm.Customer && { customerId: ctx.actor.id }),
    };
    const rows = await this.orders.find(where, {
      limit: input.limit + 1,
      after: input.cursor,
      orderBy: { createdAt: "desc" },
      populate: ["lines"],
    });
    const page = rows.slice(0, input.limit);
    return {
      items: page.map((o) => this.orders.toView(o)),
      nextCursor: rows.length > input.limit ? page.at(-1)?.id : undefined,
      hasMore: rows.length > input.limit,
    };
  }
}
