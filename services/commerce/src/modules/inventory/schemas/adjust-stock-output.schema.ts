/**
 * Stackra file contract:
 * Purpose: `AdjustStockOutput`: the row after the write; `available` already subtracts current
 *          reservations.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** The row after the write; `available` already subtracts current reservations. */
export class AdjustStockOutput extends Schema(
  z.object({ variantId: z.string(), onHand: z.number().int(), available: z.number().int() }),
) {}
