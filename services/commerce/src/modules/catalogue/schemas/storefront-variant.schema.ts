/**
 * Stackra file contract:
 * Purpose: `StorefrontVariant`: a sellable variant with its price now, its option values (`{ size:
 *          "M" }`) and whether stock covers one unit.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082 (public area), ADR 0221 (hybrid search),
 *                     guides/programming-model.mdx#schemas; apps/web product and store routes
 */
import { Schema, z } from "@stackra/schema";

/**
 * A sellable variant with its price now, its option values (`{ size: "M" }`) and whether stock
 * covers one unit.
 */
export class StorefrontVariant extends Schema(
  z.object({
    id: z.string(),
    sku: z.string(),
    priceMinor: z.number().int(),
    inStock: z.boolean(),
    options: z.record(z.string(), z.string()),
  }),
) {}
