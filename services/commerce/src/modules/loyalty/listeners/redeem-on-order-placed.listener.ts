/**
 * Stackra file contract:
 * Purpose: debits the points an order used, once the order exists.
 * Boundary: in-process listener, after commit, idempotent on the order id (the ledger refuses a
 *           repeated reference). Ids cross into the kit as `MemberId` .
 * Runtime: node
 * Governing contract: ADR 0078, guides/programming-model.mdx#listeners
 */
import { OnEvent, type ListenerContext } from "@stackra/events";
import { LoyaltyService, memberId } from "@stackra/loyalty-kit";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderPlaced } from "#modules/orders/events/order-placed.event";
import { AdjustmentCode } from "#modules/loyalty/enums/adjustment-code.enum";

/** The write half of redemption: the hook priced the discount, this listener takes the points. */
export class RedeemOnOrderPlacedListener {
  constructor(
    private readonly loyalty: LoyaltyService,
    private readonly orders: OrderService,
  ) {}

  /** Finds the loyalty adjustment on the stored order; its amount is the points debited (1:1). */
  @OnEvent(OrderPlaced)
  async handle(event: OrderPlaced, ctx: ListenerContext): Promise<void> {
    const order = await this.orders.findOneOrFail({ id: event.data.orderId });
    const used = order.adjustments.find((a) => a.code === AdjustmentCode.LoyaltyPoints.value);
    if (!used) return;
    // shortcut: the verify hook checked the balance before reserve; a concurrent redemption can
    // still overdraw by one order. Upgrade to a ledger hold taken in the hook and settled here
    // when overdrafts are seen in audit.
    const member = memberId(event.data.customerId);
    await this.loyalty.redeem(member, -used.amountMinor, event.data.orderId, ctx.now());
  }
}
