/**
 * Stackra file contract:
 * Purpose: `OrderLinesOutput`: each line with the variant's SKU and whether it still tracks
 *          inventory.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0104 (links), guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** Each line with the variant's SKU and whether it still tracks inventory. */
export class OrderLinesOutput extends Schema(
  z.object({
    lines: z.array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int(),
        unitPriceMinor: z.number().int(),
        sku: z.string(),
        trackInventory: z.boolean(),
      }),
    ),
  }),
) {}
