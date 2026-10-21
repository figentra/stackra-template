/**
 * Stackra file contract:
 * Purpose: `VariantHit`: one sellable variant with enough of its product for a POS line.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** One sellable variant with enough of its product for a POS line. */
export class VariantHit extends Schema(
  z.object({
    variantId: z.string(),
    productId: z.string(),
    sku: z.string(),
    title: z.string(),
    trackInventory: z.boolean(),
  }),
) {}
