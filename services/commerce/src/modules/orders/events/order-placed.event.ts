/**
 * Stackra file contract:
 * Purpose: the fact that a pending order exists with its stock reserved; payment not yet
 *          authorized. Public, so it leaves through the outbox as `orders.order.placed.v1`.
 * Boundary: one event per class; recorded by OrderService.createPending, never emitted from two
 *           places. Carries ids and the total so the confirmation mail needs no second read.
 * Runtime: isomorphic
 * Governing contract: ADR 0141 (names and envelope), ADR 0078 (outbox),
 *                     guides/programming-model.mdx#events
 */
import { Event, IntegrationEvent, z } from "@stackra/events";

/**
 * `order.record(new OrderPlaced({ … }))` in OrderService; consumed by loyalty (redeem) and the
 * confirmation listener.
 */
@Event({ name: "order.placed", public: true })
export class OrderPlaced extends IntegrationEvent(
  z.object({
    orderId: z.string(),
    customerId: z.string(),
    totalMinor: z.number().int(),
    currency: z.string(),
    lines: z.array(z.object({ variantId: z.string(), quantity: z.number().int() })),
  }),
) {}
