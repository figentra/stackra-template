/**
 * Stackra file contract:
 * Purpose: `CancelOrderOutput`: confirms the cancellation with the state the order ended in
 *          (`cancelled`; the job's path yields `expired`).
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";

/**
 * Confirms the cancellation with the state the order ended in (`cancelled`; the job's path yields
 * `expired`).
 */
export class CancelOrderOutput extends Schema(
  z.object({ orderId: z.string(), status: OrderStatus.schema }),
) {}
