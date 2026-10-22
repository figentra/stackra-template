/**
 * Stackra file contract:
 * Purpose: the override point "how today's revenue is drawn": the revenue-today widget's component
 *          slot.
 * Boundary: a declaration, no React. No panel default fits a sparkline, so an app MUST bind a
 *           component (gen fails on a consuming app that does not); props are the widget query's
 *           output.
 * Runtime: isomorphic
 * Governing contract: ADR 0164, ADR 0234 d9 (amended), guides/programming-model.mdx#widgets,
 *                     guides/programming-model.mdx#override-points, ADR 0231
 */
import { OverridePoint } from "@stackra/panel";
import type { OrdersTodayOutput } from "#modules/orders/schemas/orders-today-output.schema";

/** What the console's component receives: the query output as is. */
export type RevenueSparklineProps = OrdersTodayOutput;

/** Used as `component` of RevenueTodayWidget; wire key `orders.revenue_sparkline`. */
@OverridePoint({ key: "revenue_sparkline", required: true })
export class RevenueSparkline extends OverridePoint<RevenueSparklineProps> {}
