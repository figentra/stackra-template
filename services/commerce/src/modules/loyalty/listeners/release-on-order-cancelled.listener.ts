/**
 * Stackra file contract:
 * Purpose: gives the points an order held back when the order ends unpaid: cancelled by the
 *          customer or staff, expired by the job, or rolled back after a refused payment.
 * Boundary: subscribed to `orders.order.cancelled.v1` by the type of the event parameter (every
 *           unpaid end records it, with its reason); runs in process after commit, once per event
 *           id. `LoyaltyService#release` credits what the hold took, at most once per order and
 *           whether or not the hold was settled, so a redelivered or out-of-order event changes
 *           nothing more. An order that spent no points holds nothing and releases nothing. Ids
 *           cross into the kit as `MemberId`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 16 and 24), ADR 0078 d4 (listener semantics), ADR 0265
 */
import { type LoyaltyService, memberId } from "@acme/loyalty-kit";
import { Listener, type ListenerContext } from "@stackra/events";
import type { OrderCancelled } from "#modules/orders/events/order-cancelled.event";

/** The undo half of redemption: an order that never got paid spends no points. */
export class ReleaseOnOrderCancelledListener extends Listener {
  /**
   * @param loyalty - the kit's service; `release` finds the hold by the order id.
   */
  constructor(private readonly loyalty: LoyaltyService) {
    super();
  }

  /** Releases the order's hold, whatever the reason the order ended. */
  async handle(event: OrderCancelled, ctx: ListenerContext): Promise<void> {
    await this.loyalty.release(memberId(event.customerId), event.orderId, ctx.now());
  }
}
