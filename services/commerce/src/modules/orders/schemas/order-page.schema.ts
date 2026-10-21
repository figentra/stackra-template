/**
 * Stackra file contract:
 * Purpose: `OrderPage`: one cursor page of orders, the output of `orders.order.list`.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0117, http conventions (cursor pagination),
 *                     guides/programming-model.mdx#schemas
 */
import { Page } from "@stackra/schema";
import { OrderView } from "#modules/orders/schemas/order-view.schema";

/** `{ items: OrderView[], nextCursor?, hasMore }`. */
export class OrderPage extends Page(OrderView) {}
