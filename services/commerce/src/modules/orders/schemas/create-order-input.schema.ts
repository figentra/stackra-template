/**
 * Stackra file contract:
 * Purpose: `CreateOrderInput`: one to a hundred lines by variant public id; `extensions` is typed
 *          per extender by gen (`loyalty.redeemPoints`).
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095 (Zod), ADR 0136 (actor from context),
 *                     guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/**
 * One to a hundred lines by variant public id; `extensions` is typed per extender by gen
 * (`loyalty.redeemPoints`).
 */
export class CreateOrderInput extends Schema(
  z.object({
    lines: z
      .array(z.object({ variantId: z.string(), quantity: z.number().int().positive() }))
      .min(1)
      .max(100),
    extensions: z.record(z.string(), z.unknown()).default({}),
  }),
) {}
