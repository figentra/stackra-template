/**
 * Stackra file contract:
 * Purpose: `CreateOrderOutput`: the new order, always pending, its totals and the payment
 *          provider's client secret the storefront collects the payment with.
 * Boundary: a shape class in schemas/, one declaration per file; the action returns it and
 *           CreateOrderWorkflow#output builds it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 8 and 13)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";

/** What `orders.order.create` returns. */
export class CreateOrderOutput extends Schema {
  /** The new order's public id. */
  orderId!: PublicId<"ord">;

  /** Always `pending_payment` at this point. */
  status!: OrderStatus;

  /** The priced totals the customer will pay. */
  totals!: OrderTotals;

  /** The secret the storefront hands to the payment provider's client. */
  paymentClientSecret!: string;
}
