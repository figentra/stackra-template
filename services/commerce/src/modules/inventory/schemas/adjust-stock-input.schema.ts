/**
 * Stackra file contract:
 * Purpose: `AdjustStockInput`: the absolute on-hand count for one variant at one location, with why
 *          it changed.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";
import { StockAdjustReason } from "#modules/inventory/enums/stock-adjust-reason.enum";

/** The absolute on-hand count for one variant at one location, with why it changed. */
export class AdjustStockInput extends Schema(
  z.object({
    variantId: z.string(),
    locationId: z.string(),
    onHand: z.number().int().min(0),
    reason: StockAdjustReason.schema,
  }),
) {}
