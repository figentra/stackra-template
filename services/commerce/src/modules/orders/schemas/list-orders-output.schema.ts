/**
 * Stackra file contract:
 * Purpose: `ListOrdersOutput`: one page of `orders.order.list@1`: OrderView rows and the cursor.
 * Boundary: a shape class in schemas/, one declaration per file. Its item type is the row of
 *           OrderResource's table (`Resource<Order, OrderView>`), so every table key is a path of
 *           OrderView (`totals.totalMinor`).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), cursor pagination in the HTTP conventions
 */
import { Page } from "@stackra/validation";
import { OrderView } from "#modules/orders/schemas/order-view.schema";

/** One page: `items`, `nextCursor` (absent on the last page) and `hasMore`. */
export class ListOrdersOutput extends Page.of(OrderView) {}
