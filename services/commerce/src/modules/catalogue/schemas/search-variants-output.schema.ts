/**
 * Stackra file contract:
 * Purpose: `SearchVariantsOutput`: the hits, best match first.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";
import { VariantHit } from "#modules/catalogue/schemas/variant-hit.schema";

/** The hits, best match first. */
export class SearchVariantsOutput extends Schema(z.object({ items: VariantHit.schema.array() })) {}
