/**
 * Stackra file contract:
 * Purpose: `OrderListFilter`: cursor, limit (1–100, default 20) and an optional status.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0117, http conventions (cursor pagination),
 *                     guides/programming-model.mdx#schemas
 */
import { PageFilter } from "@stackra/schema";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";

/**
 * Cursor, limit (1–100, default 20) and an optional status. The customer is the actor, never a
 * filter.
 */
export class OrderListFilter extends PageFilter({ status: OrderStatus.schema.optional() }) {}
