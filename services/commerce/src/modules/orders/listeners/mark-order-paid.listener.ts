/**
 * Stackra file contract:
 * Purpose: when the payments service reports a capture for an order, mark the order paid.
 * Boundary: subscribed to `payments.payment.captured.v1` by the type of the event parameter, a
 *           class gen writes into `#stackra/clients/payments` from the payments manifest; never
 *           imports payments code. Runs once per event id (inbox dedup) in its own transaction. A
 *           capture whose reference is not an order id (a gift card) returns at once.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0260 d3 (events across services), ADR 0078
 *                     d4 (listener semantics)
 */
import { Listener, type ListenerContext } from "@stackra/events";
import type { PaymentCaptured } from "#stackra/clients/payments";
import { Order } from "#modules/orders/models/order.model";
import type { OrderService } from "#modules/orders/services/order.service";

/** Bridges the payments capture fact into the order lifecycle; the only consumer of the capture. */
export class MarkOrderPaidListener extends Listener {
  /** @param orders - its `markPaid` is idempotent on the payment id. */
  constructor(private readonly orders: OrderService) {
    super();
  }

  /** The reference is whatever the authorizer passed; orders pass the order's public id. */
  async handle(event: PaymentCaptured, ctx: ListenerContext): Promise<void> {
    if (!Order.isPublicId(event.reference)) return;
    await this.orders.markPaid(event.reference, event.paymentId, ctx.now());
  }
}
