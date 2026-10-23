/**
 * Stackra file contract:
 * Purpose: `OrderPlacedData`: what the order confirmation renders: the pending order and the
 *          storefront link to it.
 * Boundary: a shape class in schemas/, one declaration per file. OrderPlacedNotification#data
 *           builds it once per event and every channel (mail today) reads it; order-placed.mail.tsx
 *           receives it as its props.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0223 (notifications)
 */
import { Schema } from "@stackra/validation";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";

/** The order as stored and the absolute link the mail's button opens. */
export class OrderPlacedData extends Schema {
  /** The pending order as stored. */
  order!: OrderView;

  /** The absolute storefront link to the order. */
  url!: string;
}
