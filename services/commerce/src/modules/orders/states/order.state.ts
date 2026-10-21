/**
 * Stackra file contract:
 * Purpose: the Order lifecycle as state classes with allowed transitions (Spatie model-states shape
 *          over @stackra/state-machine, ADR 0161). The persisted value is the OrderStatus enum
 *          case.
 * Boundary: a state family is one declaration and one file (the one exception to
 *           one-class-per-file, ADR 0128 d2, because the family references itself). Behaviour that
 *           depends on the state lives here (`canCancel`), so no service compares status codes.
 *           Transitions with side effects are transition classes that record events.
 * Runtime: node
 * Governing contract: ADR 0161 (state machine package), ADR 0128 (family exception),
 *                     guides/programming-model.mdx#states
 */
import { ModelState, Transition } from "@stackra/state-machine";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderPaid } from "#modules/orders/events/order-paid.event";
import { OrderCancelled } from "#modules/orders/events/order-cancelled.event";
import type { Order } from "#modules/orders/models/order.model";

/**
 * Base of every order state; the column stores `value` (an OrderStatus case), typed by the enum.
 */
export abstract class OrderState extends ModelState<Order, OrderStatus> {
  /** Whether a cancel transition is allowed from here; the policy and the console both ask this. */
  canCancel(): boolean {
    return false;
  }
}

/** Placed and reserved; the only state money has not moved in. */
export class PendingPayment extends OrderState {
  /** The enum case this state persists as. */
  static readonly value = OrderStatus.PendingPayment;
  /** The states this one may move to; empty means terminal. */
  static readonly transitions = () => [Paid, Cancelled, Expired];
  /** Yes: no money has moved, so a cancel is allowed. */
  override canCancel(): boolean {
    return true;
  }
}

/** Payment captured; the order is final and terminal. */
export class Paid extends OrderState {
  /** The enum case this state persists as. */
  static readonly value = OrderStatus.Paid;
  /** The states this one may move to; empty means terminal. */
  static readonly transitions = () => [];
}

/** Ended by a person or a failed payment. */
export class Cancelled extends OrderState {
  /** The enum case this state persists as. */
  static readonly value = OrderStatus.Cancelled;
  /** The states this one may move to; empty means terminal. */
  static readonly transitions = () => [];
}

/** Ended by the expiry job. */
export class Expired extends OrderState {
  /** The enum case this state persists as. */
  static readonly value = OrderStatus.Expired;
  /** The states this one may move to; empty means terminal. */
  static readonly transitions = () => [];
}

/**
 * PendingPayment → Paid with the payment facts; idempotent on the payment id (the service checks
 * before calling).
 */
export class MarkPaid extends Transition<Order, PendingPayment, Paid> {
  /**
   * @param paymentId - the payments service's id of the captured payment.
   * @param at - capture time from the event, so a redelivery keeps the same `paidAt`.
   */
  constructor(
    private readonly paymentId: string,
    private readonly at: Date,
  ) {
    super();
  }

  /**
   * Writes the payment facts and records `order.paid`; the outbox receives it when the unit of work
   * flushes.
   */
  handle(order: Order): Paid {
    order.paymentId = this.paymentId;
    order.paidAt = this.at;
    order.record(
      new OrderPaid({
        orderId: order.id,
        customerId: order.customerId,
        paymentId: this.paymentId,
        totalMinor: order.totalMinor,
        currency: order.currency,
      }),
    );
    return new Paid();
  }
}

/** PendingPayment → Cancelled | Expired, by reason. */
export class End extends Transition<Order, PendingPayment, Cancelled | Expired> {
  constructor(private readonly reason: CancelReason) {
    super();
  }

  /** One event for every kind of end; the reason tells consumers apart. */
  handle(order: Order): Cancelled | Expired {
    order.record(
      new OrderCancelled({ orderId: order.id, customerId: order.customerId, reason: this.reason }),
    );
    return this.reason === CancelReason.Expired ? new Expired() : new Cancelled();
  }
}
