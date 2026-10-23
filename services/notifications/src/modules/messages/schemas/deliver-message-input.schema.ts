/**
 * Stackra file contract:
 * Purpose: `DeliverMessageInput`: what the delivery job carries: the message row and the rendered
 *          body.
 * Boundary: a shape class in schemas/, one declaration per file; SendMessageAction builds it,
 *           DeliverMessageAction takes it and MessageService#deliver reads it. The body lives only
 *           in the job payload, never in a table (ADR 0134); the queue drops it once the job ends.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 8 and 13), ADR 0134, ADR 0148
 */
import type { PublicId } from "@stackra/contracts";
import { Schema, Str } from "@stackra/validation";

/** The message by public id plus its HTML and text parts. */
export class DeliverMessageInput extends Schema {
  /** The message's public id. */
  messageId!: PublicId<"msg">;

  /** The rendered HTML body. */
  @Str({ min: 1 })
  html!: string;

  /** The rendered plain-text body. */
  @Str({ min: 1 })
  text!: string;
}
