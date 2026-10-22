/**
 * Stackra file contract:
 * Purpose: `CancelOrderInput`: the order to cancel, by public id.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** The order to cancel, by public id. */
export class CancelOrderInput extends Schema(z.object({ orderId: z.string() })) {}
