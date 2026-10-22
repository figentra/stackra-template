/**
 * Stackra file contract:
 * Purpose: the fact that an order left its lifecycle; `reason` says who or what ended it. Public:
 *          `orders.order.cancelled.v1`.
 * Boundary: one event per class; recorded by the End transition only. The reason is the enum's
 *           codec, so consumers receive the snake_case code and this service's listeners receive
 *           the case.
 * Runtime: isomorphic
 * Governing contract: ADR 0141, ADR 0078, guides/programming-model.mdx#events
 */
import { Event, IntegrationEvent, z } from "@stackra/events";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";

/**
 * Recorded for a customer, staff, expiry or payment-failed end alike; the reason tells them apart.
 */
@Event({ name: "order.cancelled", public: true })
export class OrderCancelled extends IntegrationEvent(
  z.object({ orderId: z.string(), customerId: z.string(), reason: CancelReason.schema }),
) {}
