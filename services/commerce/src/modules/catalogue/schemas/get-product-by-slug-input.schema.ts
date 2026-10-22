/**
 * Stackra file contract:
 * Purpose: `GetProductBySlugInput`: the product to read, by its tenant-unique slug (the storefront
 *          URL segment).
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** The product to read, by its tenant-unique slug (the storefront URL segment). */
export class GetProductBySlugInput extends Schema(z.object({ slug: z.string().max(200) })) {}
