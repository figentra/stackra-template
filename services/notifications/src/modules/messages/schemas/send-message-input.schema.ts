/**
 * Stackra file contract:
 * Purpose: `SendMessageInput`: the rendered parts of one mail plus the recipient principal and the
 *          `@Mail` key it came from.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, 0134, guides/programming-model.mdx#schemas, D.12
 */
import { Schema, z } from "@stackra/schema";

/** The rendered parts of one mail plus the recipient principal and the `@Mail` key it came from. */
export class SendMessageInput extends Schema(
  z.object({
    mail: z.string().regex(/^[a-z][a-z0-9_]*$/),
    to: z.object({ principalId: z.string() }),
    subject: z.string().min(1).max(200),
    html: z.string().min(1),
    text: z.string().min(1),
  }),
) {}
