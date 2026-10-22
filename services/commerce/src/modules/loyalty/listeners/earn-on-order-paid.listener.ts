/**
 * Stackra file contract:
 * Purpose: earns points when an order is paid.
 * Boundary: queued; idempotent on the order id (the ledger refuses a repeated reference). Calls
 *           `AccountService.earn`, the kit's one earn path: it enrolls on the first earn, runs the
 *           `earnAdjust` chain (tier multiplier), appends to the ledger and records `PointsEarned`,
 *           which promotes tiers (ADR 0265). The first paid order earns.
 * Runtime: node
 * Governing contract: ADR 0078, ADR 0265, guides/programming-model.mdx#listeners
 */
import { OnEvent } from "@stackra/events";
import { memberId } from "@acme/loyalty-kit";
import { AccountService } from "@acme/loyalty-kit/node";
import { Queues } from "#stackra/queues";
import { OrderPaid } from "#modules/orders/events/order-paid.event";

/** Credits points for the paid total; the event carries the total, so no second read is needed. */
export class EarnOnOrderPaidListener {
  constructor(private readonly accounts: AccountService) {}

  /** Paid orders earn points; the kit enrolls the customer on their first one. */
  @OnEvent(OrderPaid, { queue: Queues.Default })
  async handle(event: OrderPaid): Promise<void> {
    await this.accounts.earn(memberId(event.data.customerId), {
      amountMinor: event.data.totalMinor,
      currency: event.data.currency,
      reference: event.data.orderId,
    });
  }
}
