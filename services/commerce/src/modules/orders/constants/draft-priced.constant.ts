/**
 * Stackra file contract:
 * Purpose: `DRAFT_PRICED`: the structured log event OrderPricingService writes once per priced
 *          draft.
 * Boundary: a module constant in constants/, one declaration per file; dashboards and alerts match
 *           the event by this exact name, so it changes only with them.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0184 (telemetry and log retention)
 */

/** Logged with the line count and the adjustment codes, never amounts or ids. */
export const DRAFT_PRICED = "orders.draft_priced";
