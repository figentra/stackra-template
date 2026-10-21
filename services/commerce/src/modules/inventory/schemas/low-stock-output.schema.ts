/**
 * Stackra file contract:
 * Purpose: `LowStockOutput`: the rows, lowest first.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";
import { LowStockItem } from "#modules/inventory/schemas/low-stock-item.schema";

/** The rows, lowest first. */
export class LowStockOutput extends Schema(z.object({ items: LowStockItem.schema.array() })) {}
