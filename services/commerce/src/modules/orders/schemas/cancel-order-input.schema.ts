/**
 * Stackra file contract:
 * Purpose: `CancelOrderInput`: the order `orders.order.cancel@1` cancels, by public id.
 * Boundary: a shape class in schemas/, one declaration per file. Its only field is the record id,
 *           so the panel places CancelOrderAction on the row and the View header, and `.bulk()`
 *           adds the bulk bar; the customer is the actor, never a field.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The order to cancel; the `orderId` field makes CancelOrderAction a record action. */
export class CancelOrderInput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;
}
