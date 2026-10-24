/**
 * Stackra file contract:
 * Purpose: `orders.order.list@1`: the caller's orders, cursor-paginated, sorted and filtered by the
 *          closed table contract of OrderResource.
 * Boundary: read only, no transaction. OrderResource's table compiles into ListOrdersInput (a
 *           `TableInput`), so sort and filter keys are a closed set checked before `handle` and
 *           backed by indexes; `CrudService.table` applies them with the ORM, so no raw field name
 *           ever reaches SQL. Hand-written only for the customer rule: a customer is narrowed to
 *           their own rows in the query itself (a per-record policy would page unevenly). L0, so an
 *           MCP tool (`orders_order_list`) by default; the endpoint is derived (`GET /orders`);
 *           `intent: true` lets the palette and the intent router run it, with the phrases in
 *           `assets/lang/<locale>/orders.json` under `actions.order.list.intents`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0098, ADR 0155, ADR 0164 (as amended for v3.1), cursor
 *                     pagination in the HTTP conventions
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, Realm } from "@stackra/contracts";
import type { ListOrdersInput } from "#modules/orders/schemas/list-orders-input.schema";
import { ListOrdersOutput } from "#modules/orders/schemas/list-orders-output.schema";
import type { OrderService } from "#modules/orders/services/order.service";

/** Behind the mobile order history and the console list; customers see only their own rows. */
export class ListOrdersQuery extends Query({
  key: "order.list",
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  intent: true,
}) {
  /**
   * @param orders - the table read (sort, filter, keyset cursor) and the row-to-view mapping.
   */
  constructor(private readonly orders: OrderService) {
    super();
  }

  /** The table contract plus the customer rule; the cursor breaks sort ties on the id. */
  async handle(input: ListOrdersInput, ctx: QueryContext): Promise<ListOrdersOutput> {
    const page = await this.orders.table(input, {
      where: ctx.actor.realm === Realm.Customer ? { customerId: ctx.actor.id } : {},
      populate: ["lines"],
    });
    return ListOrdersOutput.create({
      ...page,
      items: page.items.map((order) => this.orders.toView(order)),
    });
  }
}
