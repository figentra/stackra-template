/**
 * Stackra file contract:
 * Purpose: `OrderKpisInput`: the period `orders.order.kpis@1` reports on and what it is compared
 *          with.
 * Boundary: a shape class in schemas/, one declaration per file. It extends `TimeRangeInput`
 *           (`range`, custom `from` and `to`, `compare`), so the widget's picker and the
 *           dashboard's one range picker drive it; the tenant and its time zone come from the
 *           context.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1)
 */
import { TimeRangeInput } from "@stackra/panel";

/** `range` (a TimeRange), custom `from` and `to`, and `compare` come from TimeRangeInput. */
export class OrderKpisInput extends TimeRangeInput {}
