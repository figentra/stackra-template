/**
 * Stackra file contract:
 * Purpose: the fact that an order left its lifecycle unpaid; `reason` says who or what ended it.
 *          Leaves through the outbox as `orders.order.cancelled.v1`.
 * Boundary: an integration event recorded by OrderStateMachine#cancel and #expire only. The reason
 *           is a CancelReason code, so every consumer receives the snake_case code.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141, ADR 0078
 */
import type { PublicId } from "@stackra/contracts";
import { IntegrationEvent } from "@stackra/events";
import type { CancelReason } from "#modules/orders/enums/cancel-reason.enum";

/** Recorded for every kind of end (customer, staff, expiry, failed payment); `reason` says which. */
export class OrderCancelled extends IntegrationEvent({ name: "order.cancelled" }) {
  /** The order that ended. */
  orderId!: PublicId<"ord">;

  /** The customer who placed it. */
  customerId!: PublicId<"usr">;

  /** Who or what ended it. */
  reason!: CancelReason;
}
