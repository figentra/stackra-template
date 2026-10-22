/**
 * Stackra file contract:
 * Purpose: `StorefrontProductView`: the product page: every variant priced, images, the rich-text
 *          description document, seo and the collections it sits in.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082 (public area), ADR 0221 (hybrid search),
 *                     guides/programming-model.mdx#schemas; apps/web product and store routes
 */
import { Schema, z } from "@stackra/schema";
import { StorefrontImage } from "#modules/catalogue/schemas/storefront-image.schema";
import { StorefrontVariant } from "#modules/catalogue/schemas/storefront-variant.schema";

/**
 * The product page: every variant priced, images, the rich-text description document, seo and the
 * collections it sits in.
 */
export class StorefrontProductView extends Schema(
  z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    currency: z.string(),
    /** True when at least one variant is in stock. */
    inStock: z.boolean(),
    images: z.array(StorefrontImage.schema),
    /** The merchant's rich-text document (L2), rendered by the experience renderer; never HTML. */
    description: z.unknown(),
    variants: z.array(StorefrontVariant.schema),
    seo: z.object({
      title: z.string().nullable(),
      description: z.string().nullable(),
      noindex: z.boolean(),
    }),
    collections: z.array(z.object({ title: z.string(), slug: z.string() })),
  }),
) {}
