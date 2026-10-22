/**
 * Stackra file contract:
 * Purpose: `OrderView`: an order as the API, the console and other services see it; `createdAt` is
 *          ISO 8601.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0117, http conventions (cursor pagination),
 *                     guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";
import { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";

/** An order as the API, the console and other services see it; `createdAt` is ISO 8601. */
export class OrderView extends Schema(
  z.object({
    id: z.string(),
    status: OrderStatus.schema,
    totals: OrderTotals.schema,
    lines: z.array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int(),
        unitPriceMinor: z.number().int(),
      }),
    ),
    createdAt: z.iso.datetime(),
  }),
) {}
