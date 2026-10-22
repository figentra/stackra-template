/**
 * Stackra file contract:
 * Purpose: `PricedLine`: a requested line with the unit price the pricing service quoted for it, in
 *          minor units.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0265 (typed extensions), guides/programming-model.mdx#schemas,
 *                     guides/programming-model.mdx#hooks
 */
import { Schema, z } from "@stackra/schema";

/** A requested line with the unit price the pricing service quoted for it, in minor units. */
export class PricedLine extends Schema(
  z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
    unitPriceMinor: z.number().int(),
  }),
) {}
