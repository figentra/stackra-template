/**
 * Stackra file contract:
 * Purpose: `SearchProductsInput`: the storefront search phrase (2 to 64 characters), an optional
 *          collection slug, cursor and limit.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082 (public area), ADR 0221 (hybrid search),
 *                     guides/programming-model.mdx#schemas; apps/web store route
 */
import { PageFilter, z } from "@stackra/schema";

/** The storefront search phrase (2 to 64 characters), an optional collection slug, cursor and limit. */
export class SearchProductsInput extends PageFilter({
  q: z.string().min(2).max(64),
  collection: z.string().max(200).optional(),
}) {}
