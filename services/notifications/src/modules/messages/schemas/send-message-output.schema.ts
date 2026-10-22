/**
 * Stackra file contract:
 * Purpose: `SendMessageOutput`: the message's public id; the same id comes back for a redelivered
 *          command.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, 0134, guides/programming-model.mdx#schemas, D.12
 */
import { Schema, z } from "@stackra/schema";

/** The message's public id; the same id comes back for a redelivered command. */
export class SendMessageOutput extends Schema(z.object({ messageId: z.string() })) {}
