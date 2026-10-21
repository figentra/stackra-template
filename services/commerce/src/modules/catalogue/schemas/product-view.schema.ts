/**
 * Stackra file contract:
 * Purpose: `ProductView`: a product as the API sees it: public ids, the title in the request
 *          locale, and the variants' ids and SKUs.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0117, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";

/**
 * A product as the API sees it: public ids, the title in the request locale, and the variants' ids
 * and SKUs.
 */
export class ProductView extends Schema(
  z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    status: ProductStatus.schema,
    variants: z.array(z.object({ id: z.string(), sku: z.string() })),
  }),
) {}
