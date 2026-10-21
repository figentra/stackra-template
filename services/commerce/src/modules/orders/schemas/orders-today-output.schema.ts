/**
 * Stackra file contract:
 * Purpose: `OrdersTodayOutput`: count and revenue of today's paid orders, plus revenue per hour so
 *          the sparkline needs no second call.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/**
 * Count and revenue of today's paid orders, plus revenue per hour so the sparkline needs no second
 * call.
 */
export class OrdersTodayOutput extends Schema(
  z.object({
    count: z.number().int(),
    revenueMinor: z.number().int(),
    currency: z.string(),
    hourly: z.array(z.number().int()).length(24),
  }),
) {}
