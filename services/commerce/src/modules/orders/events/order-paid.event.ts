/**
 * Stackra file contract:
 * Purpose: the fact that an order's payment was captured. Leaves through the outbox as
 *          `orders.order.paid.v1`; other services consume it from the committed manifest, and
 *          tenants may subscribe an outbound webhook to it.
 * Boundary: an integration event recorded by OrderStateMachine#markPaid only. Version 1 until a
 *           breaking change adds `version: 2` and `order-paid-v1.change.ts` beside this file. The
 *           broadcast declares `orders.order.read` as the permission a session needs to receive the
 *           data-free refresh on `tenant.{tenantId}.orders`, because the payload carries the paid
 *           total and the customer id; @stackra/realtime enforces it at delivery. `webhook: true`
 *           lets @stackra/webhooks deliver it, signed, to the endpoints a tenant registers.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141, ADR 0078, ADR 0225 (broadcast)
 */
import type { PublicId } from "@stackra/contracts";
import { IntegrationEvent } from "@stackra/events";
import type { CurrencyCode } from "@stackra/money";
import { Int } from "@stackra/validation";
import { OrderPermissions } from "#modules/orders/access/order.permissions";

/**
 * Recorded once per order when its payment is captured; the paid total rides along so loyalty
 * earns without a second read.
 *
 * @example
 * order.record(OrderPaid.create({ orderId, customerId, paymentId, totalMinor, currency }));
 * async handle(event: OrderPaid) { event.paymentId } // in a listener
 */
export class OrderPaid extends IntegrationEvent({
  name: "order.paid",
  webhook: true,
  broadcast: OrderPermissions.read,
}) {
  /** The paid order. */
  orderId!: PublicId<"ord">;

  /** The customer who paid. */
  customerId!: PublicId<"usr">;

  /** The payments service's id of the captured payment. */
  paymentId!: string;

  /** Amount captured, in minor units. */
  @Int({ min: 0 })
  totalMinor!: number;

  /** ISO 4217 code of `totalMinor`. */
  currency!: CurrencyCode;
}
