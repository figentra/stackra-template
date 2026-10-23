/**
 * Stackra file contract:
 * Purpose: the shape of telemetry.config.ts `vitals`: web vitals collection and its budgets.
 * Boundary: a shape class typing one nested config object; the values are the config's.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0183 (budgets)
 */
import { Schema } from "@stackra/validation";
import type { VitalsBudgets } from "#src/schemas/vitals-budgets.schema";

/** Whether vitals are collected from real sessions, and the budgets regressions are measured by. */
export class TelemetryVitals extends Schema {
  /** Collect vitals from real sessions. */
  enabled!: boolean;

  /** The budgets a regression is measured against. */
  budgets!: VitalsBudgets;
}
