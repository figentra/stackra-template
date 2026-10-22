/**
 * Stackra file contract:
 * Purpose: `StorefrontImage`: one product image; `alt` is null when the merchant left it empty (the
 *          renderer falls back to the title).
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082 (public area), ADR 0221 (hybrid search),
 *                     guides/programming-model.mdx#schemas; apps/web product and store routes
 */
import { Schema, z } from "@stackra/schema";

/**
 * One product image; `alt` is null when the merchant left it empty (the renderer falls back to the
 * title).
 */
export class StorefrontImage extends Schema(
  z.object({ url: z.string(), alt: z.string().nullable() }),
) {}
