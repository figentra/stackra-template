/**
 * Stackra file contract:
 * Purpose: governs `Order.status`: the allowed transitions and the events each one records.
 * Boundary: bound to its model by the type argument (`StateMachine<Order>`); `field` names the
 *           state column. Each method is a transition. The decorator checks `from`, runs the body
 *           in the caller's unit of work, writes `to`, and otherwise refuses with
 *           `transition_not_allowed`. Bodies set fields and record events; recorded events reach
 *           the outbox when the unit of work flushes, so a rolled-back change emits nothing.
 *           Inherited: `can(order, "cancel")` and `available(order)`. No other code writes
 *           `status`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 11 and 16), ADR 0161 (state machine), ADR 0141
 */
import { StateMachine, Transition } from "@stackra/state-machine";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderCancelled } from "#modules/orders/events/order-cancelled.event";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import type { Order } from "#modules/orders/models/order.model";

/** `pending_payment` is the only state with exits; `paid`, `cancelled` and `expired` are final. */
export class OrderStateMachine extends StateMachine<Order>({ field: "status" }) {
  /**
   * Writes the payment facts and records `order.paid` with the paid total.
   * @param capturedAt - the capture time from the event, so a redelivery keeps the same `paidAt`.
   */
  @Transition({
    from: OrderStatus.PendingPayment,
    to: OrderStatus.Paid,
  })
  markPaid(order: Order, paymentId: string, capturedAt: Date): void {
    order.paymentId = paymentId;
    order.paidAt = capturedAt;
    order.record(
      OrderPaid.create({
        orderId: order.id,
        customerId: order.customerId,
        paymentId,
        totalMinor: order.total.minor,
        currency: order.total.currency,
      }),
    );
  }

  /** Ends an unpaid order for a person or a refused payment; `reason` is never `Expired`. */
  @Transition({
    from: OrderStatus.PendingPayment,
    to: OrderStatus.Cancelled,
  })
  cancel(order: Order, reason: CancelReason): void {
    order.record(
      OrderCancelled.create({ orderId: order.id, customerId: order.customerId, reason }),
    );
  }

  /** Ends an unpaid order past the tenant's window; one event for every kind of end. */
  @Transition({
    from: OrderStatus.PendingPayment,
    to: OrderStatus.Expired,
  })
  expire(order: Order): void {
    order.record(
      OrderCancelled.create({
        orderId: order.id,
        customerId: order.customerId,
        reason: CancelReason.Expired,
      }),
    );
  }
}
