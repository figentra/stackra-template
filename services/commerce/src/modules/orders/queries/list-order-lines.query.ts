/**
 * Stackra file contract:
 * Purpose: `orders.order.list_lines`: the lines of one order with the catalogue variant each one
 *          refers to, read across the module boundary through the link with `GraphQuery`.
 * Boundary: read only. Orders never queries catalogue's table directly; the graph reader follows
 *           the declared link, under the limits of settlement R10 (20 per relation by default, 100
 *           max, depth ≤ 3, fan-out ≤ 1 000).
 * Runtime: node
 * Governing contract: ADR 0104 (query.graph over links), settlement R10,
 *                     guides/programming-model.mdx#links
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import type { GraphQuery } from "@stackra/database";
import type { OrderService } from "#modules/orders/services/order.service";
import { OrderLineVariantLink } from "#modules/orders/links/order-line-variant.link";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { OrderLinesInput } from "#modules/orders/schemas/order-lines-input.schema";
import { OrderLinesOutput } from "#modules/orders/schemas/order-lines-output.schema";
import { ActorKind, HttpMethod } from "@stackra/contracts";

/**
 * The packing-slip read: the one place orders reads catalogue data, and it does so through the
 * link.
 */
@Query({
  key: "order.list_lines",
  input: OrderLinesInput,
  output: OrderLinesOutput,
  permission: OrderPermissions.read,
  actors: [ActorKind.User, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/orders/:orderId/lines" })
export class ListOrderLinesQuery {
  /**
   * @param graph - the generated graph reader; `include` names the linked model's fields, checked
   * against the link.
   */
  constructor(
    private readonly orders: OrderService,
    private readonly graph: GraphQuery,
  ) {}

  /**
   * Reads the order, checks the policy, then follows the link to the variants.
   * @throws AppError `forbidden` when OrderPolicy.read denies a customer another customer's
   * order.
   */
  async handle(input: OrderLinesInput, ctx: QueryContext): Promise<OrderLinesOutput> {
    const order = await this.orders.findOneOrFail({ id: input.orderId });
    await ctx.authorize(OrderPermissions.read, order);
    const rows = await this.graph.through(OrderLineVariantLink, {
      where: { line: { order } },
      fields: {
        line: ["variantId", "quantity", "unitPriceMinor"],
        variant: ["sku", "trackInventory"],
      },
      limit: 100,
    });
    return {
      lines: rows.map(({ line, variant }) => ({
        variantId: line.variantId,
        quantity: line.quantity,
        unitPriceMinor: line.unitPriceMinor,
        sku: variant.sku,
        trackInventory: variant.trackInventory,
      })),
    };
  }
}
