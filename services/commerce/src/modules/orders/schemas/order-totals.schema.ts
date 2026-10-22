/**
 * Stackra file contract:
 * Purpose: `OrderTotals`: the money summary of an order in one currency: subtotal, the adjustments
 *          in the order they were applied, and the total the customer pays (subtotal plus
 *          adjustments, clamped at zero by OrderPricingService).
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0220 (integer minor units),
 *                     guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";
import { OrderAdjustment } from "#modules/orders/schemas/order-adjustment.schema";

/**
 * The money summary of an order in one currency: subtotal, the adjustments in the order they were
 * applied, and the
 * total the customer pays (subtotal plus adjustments, clamped at zero by OrderPricingService).
 */
export class OrderTotals extends Schema(
  z.object({
    currency: z.string().length(3),
    subtotalMinor: z.number().int().nonnegative(),
    adjustments: OrderAdjustment.schema.array(),
    totalMinor: z.number().int().nonnegative(),
  }),
) {}
