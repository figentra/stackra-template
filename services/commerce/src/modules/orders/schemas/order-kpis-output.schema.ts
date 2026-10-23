/**
 * Stackra file contract:
 * Purpose: `OrderKpisOutput`: the sales numbers of a period: paid revenue and paid orders, each
 *          with its comparison value, per-bucket series and target.
 * Boundary: a shape class in schemas/, one declaration per file. Each field is a metric type from
 *           @stackra/panel, so format, currency, trend, sparkline and target come from the type and
 *           the same numbers reach REST, MCP and the KPI band; the query computes, the panel only
 *           presents.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1)
 */
import type { CountMetric, MoneyMetric } from "@stackra/panel";
import { Schema } from "@stackra/validation";

/** The two sales numbers of a period, each with its comparison and per-bucket series. */
export class OrderKpisOutput extends Schema {
  /** Paid revenue in the tenant's currency; the target is the daily target times the days. */
  revenue!: MoneyMetric;

  /** Orders paid in the period. */
  orders!: CountMetric;
}
