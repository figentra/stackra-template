/**
 * Stackra file contract:
 * Purpose: `CancelOrderOutput`: what `orders.order.cancel@1` returns: the order and the state it
 *          ended in.
 * Boundary: a shape class in schemas/, one declaration per file; built by CancelOrderAction only.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";

/** The order after the cancel, with the state it ended in. */
export class CancelOrderOutput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;

  /** `cancelled`; the expiry job's path ends in `expired` instead. */
  status!: OrderStatus;
}
