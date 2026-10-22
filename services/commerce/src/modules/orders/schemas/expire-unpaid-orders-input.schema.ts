/**
 * Stackra file contract:
 * Purpose: `ExpireUnpaidOrdersInput`: how many stale orders one run handles.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** How many stale orders one run handles. */
export class ExpireUnpaidOrdersInput extends Schema(
  z.object({ batchSize: z.number().int().min(1).max(500).default(100) }),
) {}
