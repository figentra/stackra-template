/**
 * Stackra file contract:
 * Purpose: `SearchVariantsInput`: a SKU, barcode or title prefix typed at the POS; at most 50 hits.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** A SKU, barcode or title prefix typed at the POS; at most 50 hits. */
export class SearchVariantsInput extends Schema(
  z.object({ q: z.string().min(2).max(64), limit: z.number().int().min(1).max(50).default(10) }),
) {}
