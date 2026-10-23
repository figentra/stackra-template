/**
 * Stackra file contract:
 * Purpose: facts about one order for an agent's context window, plus what the agent may do next.
 * Boundary: attached when a conversation names an order id (the model's prefix comes from the
 *           base factory's argument). Permission-checked reads through the same service the
 *           queries use, public ids only (ADR 0156 guardrails).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 16 and 23), ADR 0245 (context facts), ADR 0155
 */
import { type ContextFacts, Facts, type FactsContext } from "@stackra/ai";
import { Order } from "#modules/orders/models/order.model";
import type { OrderStateMachine } from "#modules/orders/models/order.state-machine";
import type { OrderService } from "#modules/orders/services/order.service";

/** One sentence and the order view, read as the agent's principal. */
export class OrderFacts extends Facts(Order) {
  /** @param lifecycle - tells the agent whether a cancel would be allowed now. */
  constructor(
    private readonly orders: OrderService,
    private readonly lifecycle: OrderStateMachine,
  ) {
    super();
  }

  /**
   * Reads the order and summarises it.
   * @throws Refusal `forbidden` when the principal may not read this order; the gateway then
   *         omits the facts.
   */
  async provide(orderId: Order["id"], ctx: FactsContext): Promise<ContextFacts> {
    const order = await this.orders.findOneOrFail({ id: orderId }, { populate: ["lines"] });
    await ctx.authorize(order);
    const view = this.orders.toView(order);
    const total = ctx.money(view.totals.totalMinor, view.totals.currency);
    return {
      summary: `Order ${view.id} is ${view.status}, ${total}, ${view.lines.length} line(s).`,
      // the model offers cancellation only when it would succeed
      facts: { ...view, canCancel: this.lifecycle.can(order, "cancel") },
    };
  }
}
