/**
 * Stackra file contract:
 * Purpose: `LowStockItem`: one row at or under the threshold.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** One row at or under the threshold. */
export class LowStockItem extends Schema(
  z.object({ variantId: z.string(), locationId: z.string(), available: z.number().int() }),
) {}
