/**
 * Stackra file contract:
 * Purpose: `OrderReceiptData`: what the paid-order receipt renders: the order with its final totals
 *          and lines.
 * Boundary: a shape class in schemas/, one declaration per file. OrderReceiptNotification#data
 *           builds it once per event; order-receipt.mail.tsx receives it as its props.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0223 (notifications)
 */
import { Schema } from "@stackra/validation";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";

/** The paid order, read once for every channel. */
export class OrderReceiptData extends Schema {
  /** The paid order with its final totals and lines. */
  order!: OrderView;
}
