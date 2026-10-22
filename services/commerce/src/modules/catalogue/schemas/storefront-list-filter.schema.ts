/**
 * Stackra file contract:
 * Purpose: `StorefrontListFilter`: cursor, limit, an optional search phrase (hybrid search, ADR
 *          0221) and an optional collection slug.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082 (public area), ADR 0221 (hybrid search),
 *                     guides/programming-model.mdx#schemas; apps/web product and store routes
 */
import { PageFilter, z } from "@stackra/schema";

/**
 * Cursor, limit, an optional search phrase (hybrid search, ADR 0221) and an optional collection
 * slug.
 */
export class StorefrontListFilter extends PageFilter({
  search: z.string().max(200).optional(),
  collection: z.string().max(200).optional(),
}) {}
