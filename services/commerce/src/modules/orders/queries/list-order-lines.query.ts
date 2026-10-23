/**
 * Stackra file contract:
 * Purpose: `orders.order.list_lines@1`: the lines of one order with the catalogue variant each one
 *          links to, read across the module boundary with the query graph.
 * Boundary: read only. Orders never queries catalogue's table: the graph reader follows the
 *           `OrderLine.variant` link and fans out to catalogue's generated read, under the limits
 *           of ADR 0268 R10 (20 per relation by default, 100 at most, depth 3, fan-out 1,000). Its
 *           input holds the parent's id, so OrderResource shows it as the Lines relation on the
 *           View page with `orderId` bound from the record. The `endpoint` surface keeps the path
 *           `/orders/:orderId/lines` instead of the derived query path; as an L0 query it is also
 *           the MCP tool `orders_order_list_lines`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 21 and 28, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0104 d2 (query graph), ADR 0268 R10
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { GraphQuery } from "@stackra/database";
import { OrderLine } from "#modules/orders/models/order-line.model";
import type { ListOrderLinesInput } from "#modules/orders/schemas/list-order-lines-input.schema";
import { ListOrderLinesOutput } from "#modules/orders/schemas/list-order-lines-output.schema";
import type { OrderService } from "#modules/orders/services/order.service";

/** The packing-slip read: the one place orders reads catalogue data, through the link. */
export class ListOrderLinesQuery extends Query({
  key: "order.list_lines",
  actors: [ActorKind.User, ActorKind.Service],
  endpoint: {
    method: HttpMethod.Get,
    path: "/orders/:orderId/lines",
  },
}) {
  /** @param graph - the graph reader; field names are checked against both models. */
  constructor(
    private readonly orders: OrderService,
    private readonly graph: GraphQuery,
  ) {
    super();
  }

  /**
   * Reads the order, checks the policy, then follows the link to the variants.
   * @throws Refusal `forbidden` when OrderPolicy#read denies a customer another customer's order.
   */
  async handle(input: ListOrderLinesInput, ctx: QueryContext): Promise<ListOrderLinesOutput> {
    const order = await this.orders.findOneOrFail({ id: input.orderId });
    await ctx.authorize(order);
    const rows = await this.graph.through(OrderLine, "variant", {
      where: { order },
      fields: {
        line: ["variant", "quantity", "unitPrice"],
        variant: ["sku", "trackInventory"],
      },
      limit: 100,
    });
    return ListOrderLinesOutput.create({
      lines: rows.map(({ line, variant }) => ({
        variantId: line.variant.id,
        quantity: line.quantity,
        unitPriceMinor: line.unitPrice.minor,
        sku: variant.sku,
        trackInventory: variant.trackInventory,
      })),
    });
  }
}
