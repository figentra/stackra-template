/**
 * Stackra file contract:
 * Purpose: `ListOrdersInput`: the closed table input of `orders.order.list@1`: cursor, page size,
 *          sort and the typed filters OrderResource's table declares.
 * Boundary: a shape class in schemas/, one declaration per file. It extends `TableInput`, which gen
 *           narrows to the keys of the resource table bound to this query: `sort` is an enum of the
 *           sortable keys (`createdAt`, `totals.totalMinor`, and `paidAt` for the paid-today view),
 *           `filter` holds `status`, `createdAt`, `paidAt` and `customerId`, each backed by an
 *           index in the orders migrations. An undeclared sort or filter key is refused with
 *           `invalid_argument` before `handle` runs. No `search`: Order is not `@Searchable`. The
 *           customer is never a field: the query narrows a customer by the actor.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1), cursor pagination in the
 *                     HTTP conventions
 */
import { TableInput } from "@stackra/validation";

/** `cursor`, `limit` (20, 50 or 100), `sort` and `filter` come from TableInput. */
export class ListOrdersInput extends TableInput {}
