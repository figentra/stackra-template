/**
 * Stackra file contract:
 * Purpose: `ExplainOrderArgs`: the one argument the `explain-order` prompt takes.
 * Boundary: one schema class and its inferred type (ADR 0006); the prompt references it by class,
 *           so gen writes its JSON Schema into the MCP prompt listing.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0245 (versioned prompts), guides/programming-model.mdx#ai
 */
import { Schema, z } from "@stackra/schema";

/** The order to explain, by public id. */
export class ExplainOrderArgs extends Schema(z.object({ orderId: z.string() })) {}
