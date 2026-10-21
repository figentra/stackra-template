/**
 * Stackra file contract:
 * Purpose: `LowStockInput`: how many rows to return, lowest stock first; the widget asks for 5.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** How many rows to return, lowest stock first; the widget asks for 5. */
export class LowStockInput extends Schema(
  z.object({ limit: z.number().int().min(1).max(100).default(20) }),
) {}
