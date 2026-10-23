/**
 * Stackra file contract:
 * Purpose: `orders.order.list@1`: the caller's orders, newest first, cursor-paginated, filterable
 *          by status.
 * Boundary: read only, no transaction. Hand-written because the customer realm is narrowed in the
 *           query itself (a per-record policy would page unevenly). L0, so an MCP tool; the
 *           endpoint is derived (`GET /orders`).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0155, cursor pagination in
 *                     the HTTP conventions
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, Realm, SortDirection } from "@stackra/contracts";
import { CursorInput, Page } from "@stackra/validation";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderView } from "#modules/orders/schemas/order-view.schema";
import type { OrderService } from "#modules/orders/services/order.service";

/** `cursor` and `limit` (1–100, default 20) come from CursorInput; the customer is the actor. */
export class ListOrdersInput extends CursorInput {
  /** Only orders in this state. */
  status?: OrderStatus;
}

/** One page: `items`, `nextCursor` (absent on the last page) and `hasMore`. */
export class ListOrdersOutput extends Page.of(OrderView) {}

/** Behind the mobile order history and the console list; customers see only their own rows. */
export class ListOrdersQuery extends Query({
  key: "order.list",
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  intents: ["show my orders", "list recent orders"],
}) {
  /** @param orders - the paged read and the row-to-view mapping. */
  constructor(private readonly orders: OrderService) {
    super();
  }

  /** Fetches one row more than `limit` to learn `hasMore` without a count query. */
  async handle(input: ListOrdersInput, ctx: QueryContext): Promise<ListOrdersOutput> {
    const rows = await this.orders.find(
      {
        ...(input.status && { status: input.status }),
        ...(ctx.actor.realm === Realm.Customer && { customerId: ctx.actor.id }),
      },
      {
        limit: input.limit + 1,
        after: input.cursor,
        orderBy: { createdAt: SortDirection.Desc },
        populate: ["lines"],
      },
    );
    const hasMore = rows.length > input.limit;
    const page = rows.slice(0, input.limit);
    const last = page.at(-1);
    return ListOrdersOutput.create({
      items: page.map((order) => this.orders.toView(order)),
      hasMore,
      ...(hasMore && last ? { nextCursor: last.id } : {}),
    });
  }
}
