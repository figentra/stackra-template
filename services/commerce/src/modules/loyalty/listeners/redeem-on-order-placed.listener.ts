/**
 * Stackra file contract:
 * Purpose: debits the points an order used, once the order exists.
 * Boundary: subscribed to `orders.order.placed.v1` by the type of the event parameter; runs in
 *           process after commit, once per event id, and is idempotent on the order id (the ledger
 *           refuses a repeated reference). Reads the stored order through orders' exported
 *           OrderService. Ids cross into the kit as `MemberId`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 16 and 24), ADR 0078 d4 (listener semantics), ADR 0265
 */
import { type LoyaltyService, memberId } from "@acme/loyalty-kit";
import { Listener, type ListenerContext } from "@stackra/events";
import { AdjustmentCode } from "#modules/loyalty/enums/adjustment-code.enum";
import type { OrderPlaced } from "#modules/orders/events/order-placed.event";
import type { OrderService } from "#modules/orders/services/order.service";

/** The write half of redemption: the extension priced the discount, this takes the points. */
export class RedeemOnOrderPlacedListener extends Listener {
  /**
   * @param loyalty - the kit's service; `redeem` appends the debit to the ledger.
   * @param orders - orders' exported service, for the adjustments stored on the order.
   */
  constructor(
    private readonly loyalty: LoyaltyService,
    private readonly orders: OrderService,
  ) {
    super();
  }

  /** Finds the loyalty adjustment on the stored order; its amount is the points debited (1:1). */
  async handle(event: OrderPlaced, ctx: ListenerContext): Promise<void> {
    const order = await this.orders.findOneOrFail({ id: event.orderId });
    const used = order.adjustments.find(
      (adjustment) => adjustment.code === AdjustmentCode.LoyaltyPoints,
    );
    if (!used) return;
    // shortcut: the verify extension checked the balance before reserve; a concurrent redemption
    // can still overdraw by one order. Upgrade to a ledger hold taken in the extension and settled
    // here when overdrafts are seen in audit.
    const member = memberId(event.customerId);
    await this.loyalty.redeem(member, -used.amountMinor, event.orderId, ctx.now());
  }
}
