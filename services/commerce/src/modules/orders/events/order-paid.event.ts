/**
 * Stackra file contract:
 * Purpose: the fact that an order's payment was captured. Public, so it leaves through the outbox
 *          as `orders.order.paid.v1`; other services consume it from the committed manifest, and
 *          tenants may subscribe an outbound webhook to it.
 * Boundary: one event per class. Version 1 until `@Version` says otherwise. Recorded by the
 *           MarkPaid transition, never emitted from two places. Broadcast to the tenant's console
 *           sessions for live tiles. The paid total rides along so loyalty earns without a second
 *           read; `webhook: true` lets @stackra/webhooks deliver it, signed, to the endpoints a
 *           tenant registers (outbound delivery, retries and the log are the package's).
 * Runtime: isomorphic
 * Governing contract: ADR 0141, ADR 0078, ADR 0225 (broadcast),
 *                     guides/programming-model.mdx#events; ADR 0127
 */
import { Event, IntegrationEvent, z } from "@stackra/events";

/**
 * Recorded once per order when its payment is captured; carries the paid total.
 *
 * @example
 * order.record(new OrderPaid({ orderId, customerId, paymentId, totalMinor, currency }));
 * @OnEvent(OrderPaid) async handle(event: OrderPaid) { event.data.paymentId }
 */
@Event({
  name: "order.paid",
  public: true,
  webhook: true,
  broadcast: { channel: (e) => `tenant.${e.meta.tenantId}.orders` },
})
export class OrderPaid extends IntegrationEvent(
  z.object({
    orderId: z.string(),
    customerId: z.string(),
    paymentId: z.string(),
    totalMinor: z.number().int(),
    currency: z.string().length(3),
  }),
) {}
