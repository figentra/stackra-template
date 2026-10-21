/**
 * Stackra file contract:
 * Purpose: `OrdersTodayInput`: the empty input of `orders.order.stats_today`; "today" and the
 *          tenant come from the context.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** No input: "today" and the tenant come from the context. */
export class OrdersTodayInput extends Schema(z.object({})) {}
