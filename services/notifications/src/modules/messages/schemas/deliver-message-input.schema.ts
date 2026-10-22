/**
 * Stackra file contract:
 * Purpose: `DeliverMessageInput`: what the delivery job carries: the message row and the rendered
 *          body.
 * Boundary: one schema class and its inferred type (ADR 0006). The body lives only in the job
 *           payload, never in a table (ADR 0134); the queue drops it once the job ends.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, 0134, guides/programming-model.mdx#schemas; ADR 0130 (failed job +
 *                     dead letter)
 */
import { Schema, z } from "@stackra/schema";

/** The message by public id plus its html and text parts. */
export class DeliverMessageInput extends Schema(
  z.object({ messageId: z.string(), html: z.string().min(1), text: z.string().min(1) }),
) {}
