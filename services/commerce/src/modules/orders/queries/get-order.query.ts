/**
 * Stackra file contract:
 * Purpose: `orders.order.get`: one order; customers see only their own (OrderPolicy.read).
 * Boundary: read only, no transaction; L0, so also an MCP tool under the caller's permissions.
 * Runtime: node
 * Governing contract: ADR 0098, 0155, guides/programming-model.mdx#queries
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import type { OrderService } from "#modules/orders/services/order.service";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { OrderView } from "#modules/orders/schemas/order-view.schema";
import { GetOrderInput } from "#modules/orders/schemas/get-order-input.schema";
import { ActorKind, HttpMethod } from "@stackra/contracts";

/** Reads one order as OrderView. Notifications calls it (call mode) for an inbox entry's total. */
@Query({
  key: "order.get",
  input: GetOrderInput,
  output: OrderView,
  permission: OrderPermissions.read,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/orders/:orderId" })
export class GetOrderQuery {
  constructor(private readonly orders: OrderService) {}

  /**
   * Loads the record first so the policy can see it; the view is built after authorization passes.
   * @throws AppError `not_found` when no order has this id in the actor's tenant;
   *   `forbidden` when the
   *         policy denies.
   */
  async handle(input: GetOrderInput, ctx: QueryContext): Promise<OrderView> {
    const order = await this.orders.findOneOrFail({ id: input.orderId }, { populate: ["lines"] });
    await ctx.authorize(OrderPermissions.read, order);
    return this.orders.toView(order);
  }
}
