/**
 * Stackra file contract:
 * Purpose: settles the points an order holds into a redemption once the order exists.
 * Boundary: subscribed to `orders.order.placed.v1` by the type of the event parameter; runs in
 *           process after commit, once per event id. HoldPointsExtension took the hold in the same
 *           transaction that wrote the order, so the points are already out of the balance;
 *           settling is balance-neutral (a `Redeem` entry plus the entry that offsets the hold)
 *           and commutes with ReleaseOnOrderCancelledListener, so a cancel delivered first still
 *           gives the points back exactly once. Idempotent on the order id. An order that spent no
 *           points holds nothing and settles nothing. Ids cross into the kit as `MemberId`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 16 and 24), ADR 0078 d4 (listener semantics), ADR 0265
 */
import { type LoyaltyService, memberId } from "@acme/loyalty-kit";
import { Listener, type ListenerContext } from "@stackra/events";
import type { OrderPlaced } from "#modules/orders/events/order-placed.event";

/** The confirmation half of redemption: the hold becomes the order's redeemed points. */
export class SettleOnOrderPlacedListener extends Listener {
  /**
   * @param loyalty - the kit's service; `settle` finds the hold by the order id.
   */
  constructor(private readonly loyalty: LoyaltyService) {
    super();
  }

  /** Settles the order's hold; nothing happens for an order that spent no points. */
  async handle(event: OrderPlaced, ctx: ListenerContext): Promise<void> {
    await this.loyalty.settle(memberId(event.customerId), event.orderId, ctx.now());
  }
}
