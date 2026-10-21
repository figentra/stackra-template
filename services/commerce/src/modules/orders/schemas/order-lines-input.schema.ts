/**
 * Stackra file contract:
 * Purpose: `OrderLinesInput`: the order whose packing-slip lines `order.list_lines` reads.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0104 (links), guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** The order to read the lines of, by public id. */
export class OrderLinesInput extends Schema(z.object({ orderId: z.string() })) {}
