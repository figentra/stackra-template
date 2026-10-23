/**
 * Stackra file contract:
 * Purpose: earns points when an order is paid.
 * Boundary: subscribed to `orders.order.paid.v1` by the type of the event parameter; queued on the
 *           default queue, once per event id, and idempotent on the order id (the ledger refuses a
 *           repeated reference). Calls `AccountService#earn`, the kit's one earn path: it enrols
 *           on the first earn, runs the `earnAdjust` chain (the tier multiplier), appends to the
 *           ledger and records `PointsEarned`, which promotes tiers (ADR 0265). The first paid
 *           order earns.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0078 d4 (listener semantics), ADR 0265
 */
import { memberId } from "@acme/loyalty-kit";
import type { AccountService } from "@acme/loyalty-kit/node";
import { Listener } from "@stackra/events";
import { Queues } from "#stackra/queues";
import type { OrderPaid } from "#modules/orders/events/order-paid.event";

/** Credits points for the paid total; the event carries the total, so no second read is needed. */
export class EarnOnOrderPaidListener extends Listener({ queue: Queues.Default }) {
  /** @param accounts - the kit's account service; `earn` enrols the customer on the first one. */
  constructor(private readonly accounts: AccountService) {
    super();
  }

  /** Paid orders earn points against the order id as the ledger reference. */
  async handle(event: OrderPaid): Promise<void> {
    await this.accounts.earn(memberId(event.customerId), {
      amountMinor: event.totalMinor,
      currency: event.currency,
      reference: event.orderId,
    });
  }
}
