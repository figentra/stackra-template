/**
 * Stackra file contract:
 * Purpose: when the payments service reports a capture for an order, mark the order paid.
 * Boundary: consumes another service's public event through the generated event map; never imports
 *           payments code. Runs once per event id (inbox dedup) in its own transaction. A listener
 *           is marked by its `@OnEvent` method, not a class decorator (ADR 0264).
 * Runtime: node
 * Governing contract: ADR 0260 d3 (events across services), ADR 0078 d4 (listener semantics),
 *                     guides/programming-model.mdx#listeners
 */
import { type EventOf, OnEvent, type ListenerContext } from "@stackra/events";
import { Payments } from "#stackra/clients";
import { Order } from "#modules/orders/models/order.model";
import { OrderService } from "#modules/orders/services/order.service";

/** Bridges the payments capture fact into the order lifecycle; the only consumer of the capture. */
export class MarkOrderPaidListener {
  constructor(private readonly orders: OrderService) {}

  /**
   * `where` filters at the subscription, by the model's own id prefix, so captures for gift cards
   * never reach this inbox. The capture time from the event becomes `paidAt`.
   */
  @OnEvent(Payments.events.PaymentCaptured, {
    where: (e) => e.data.reference.startsWith(`${Order.idPrefix}_`),
  })
  async handle(
    event: EventOf<typeof Payments.events.PaymentCaptured>,
    ctx: ListenerContext,
  ): Promise<void> {
    await this.orders.markPaid(event.data.reference, event.data.paymentId, ctx.now());
  }
}
