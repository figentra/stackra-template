/**
 * Stackra file contract:
 * Purpose: `ExpireUnpaidOrdersOutput`: how many orders this run expired; zero is normal.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** How many orders this run expired; zero is normal. */
export class ExpireUnpaidOrdersOutput extends Schema(z.object({ expired: z.number().int() })) {}
