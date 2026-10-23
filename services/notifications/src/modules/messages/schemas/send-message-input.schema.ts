/**
 * Stackra file contract:
 * Purpose: `SendMessageInput`: the rendered parts of one mail, the recipient principal and the
 *          template key it was rendered from.
 * Boundary: a shape class in schemas/, one declaration per file; SendMessageAction takes it and
 *           MessageService#open reads it. Producers render through @stackra/notifications (the
 *           `notifications` Notifier driver) and queue it; the body travels on to the delivery job
 *           and is never stored (ADR 0134).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 8 and 13), ADR 0134, ADR 0223
 */
import { Schema, Str } from "@stackra/validation";
import type { MessageRecipient } from "#modules/messages/schemas/message-recipient.schema";

/** What a caller sends to `messages.message.send@1`. */
export class SendMessageInput extends Schema {
  /** The producer's template key, snake_case (`order_receipt`). */
  @Str({ pattern: /^[a-z][a-z0-9_]*$/ })
  mail!: string;

  /** The recipient. */
  to!: MessageRecipient;

  /** The rendered subject line. */
  @Str({
    min: 1,
    max: 200,
  })
  subject!: string;

  /** The rendered HTML body. */
  @Str({ min: 1 })
  html!: string;

  /** The rendered plain-text body. */
  @Str({ min: 1 })
  text!: string;
}
