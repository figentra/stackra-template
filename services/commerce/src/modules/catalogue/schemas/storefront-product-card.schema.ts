/**
 * Stackra file contract:
 * Purpose: `StorefrontProductCard`: the grid card: the lowest variant price and the first image.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082 (public area), ADR 0221 (hybrid search),
 *                     guides/programming-model.mdx#schemas; apps/web product and store routes
 */
import { Schema, z } from "@stackra/schema";
import { StorefrontImage } from "#modules/catalogue/schemas/storefront-image.schema";

/** The grid card: the lowest variant price and the first image. */
export class StorefrontProductCard extends Schema(
  z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    priceMinor: z.number().int(),
    currency: z.string(),
    image: StorefrontImage.schema.nullable(),
    inStock: z.boolean(),
  }),
) {}
