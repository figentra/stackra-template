/**
 * Stackra file contract:
 * Purpose: `orders.order.get@1`: one order; customers see only their own (OrderPolicy#read).
 * Boundary: read only, no transaction. The permission is derived (`OrderPermissions.read`, L0), so
 *           it is also an MCP tool under the caller's permissions; the endpoint is derived
 *           (`GET /orders/:orderId`).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0155
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, type PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";
import type { OrderService } from "#modules/orders/services/order.service";

/** The order to read, by public id. */
export class GetOrderInput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;
}

/** Reads one order as OrderView; the notifications service calls it for an inbox entry's total. */
export class GetOrderQuery extends Query({
  key: "order.get",
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
}) {
  /** @param orders - loads the record for the policy and maps it to OrderView. */
  constructor(private readonly orders: OrderService) {
    super();
  }

  /**
   * Loads the record first so the policy can see it; the view is built after authorization.
   * @throws Refusal `not_found` when no order has this id in the actor's tenant; `forbidden` when
   *         the policy denies.
   */
  async handle(input: GetOrderInput, ctx: QueryContext): Promise<OrderView> {
    const order = await this.orders.findOneOrFail({ id: input.orderId }, { populate: ["lines"] });
    await ctx.authorize(order);
    return this.orders.toView(order);
  }
}
