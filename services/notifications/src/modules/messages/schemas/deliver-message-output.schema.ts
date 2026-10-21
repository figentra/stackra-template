/**
 * Stackra file contract:
 * Purpose: `DeliverMessageOutput`: the result of one delivery attempt that succeeded.
 * Boundary: one schema class and its inferred type (ADR 0006).
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas; ADR 0130 (failed job + dead
 *                     letter)
 */
import { Schema, z } from "@stackra/schema";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";

/** The message and the status it ended in (always `sent` on a successful run). */
export class DeliverMessageOutput extends Schema(
  z.object({ messageId: z.string(), status: MessageStatus.schema }),
) {}
