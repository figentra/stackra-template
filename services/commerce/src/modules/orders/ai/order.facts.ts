/**
 * Stackra file contract:
 * Purpose: facts about one order for an agent's context window, plus what the agent may do next.
 * Boundary: a facts class (`@Facts`, formerly a context provider; ADR 0264): permission-checked
 *           reads through the same service the queries use, public ids only (ADR 0156 guardrails).
 * Runtime: node
 * Governing contract: ADR 0245 (context facts), ADR 0155, guides/programming-model.mdx#ai
 */
import { Facts, type ContextFacts, type ContextRequest } from "@stackra/ai";
import { Order } from "#modules/orders/models/order.model";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";

/**
 * Attached when a conversation references an order id (`for: Order` resolves the model's prefix).
 */
@Facts({ for: Order })
export class OrderFacts {
  constructor(private readonly orders: OrderService) {}

  /**
   * Reads the order as the agent's principal and summarises it in one sentence.
   * @throws AppError `forbidden` when the principal may not read this order; the gateway
   *         then omits the facts.
   */
  async provide(orderId: string, ctx: ContextRequest): Promise<ContextFacts> {
    const order = await this.orders.findOneOrFail({ id: orderId }, { populate: ["lines"] });
    await ctx.authorize(OrderPermissions.read, order);
    const view = this.orders.toView(order);
    const total = ctx.money(view.totals.totalMinor, view.totals.currency);
    return {
      summary: `Order ${view.id} is ${view.status.value}, ${total}, ${view.lines.length} line(s).`,
      // the model offers cancellation only when it would succeed
      facts: { ...view, canCancel: order.status.canCancel() },
    };
  }
}
