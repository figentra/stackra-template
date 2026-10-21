/**
 * Stackra file contract:
 * Purpose: `CreateOrderOutput`: the new order, always pending, its totals and the payment
 *          provider's client secret the storefront collects with.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095 (Zod), ADR 0136 (actor from context),
 *                     guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";
import { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";

/**
 * The new order, always pending, its totals and the payment provider's client secret the storefront
 * collects with.
 */
export class CreateOrderOutput extends Schema(
  z.object({
    orderId: z.string(),
    status: OrderStatus.schema,
    totals: OrderTotals.schema,
    paymentClientSecret: z.string(),
  }),
) {}
