/**
 * Stackra file contract:
 * Purpose: `ArchiveProductInput`: the product to archive, by public id.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** The product to archive, by public id. */
export class ArchiveProductInput extends Schema(z.object({ productId: z.string() })) {}
