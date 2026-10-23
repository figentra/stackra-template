/**
 * Stackra file contract:
 * Purpose: the fact that the transport accepted a message. Leaves through the outbox as
 *          `messages.message.sent.v1`, so analytics can count deliveries without a call.
 * Boundary: an integration event recorded on the Message by MessageService#deliver, once. It
 *           carries the template key so consumers can count per kind; never the address or the
 *           body.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141, ADR 0078, ADR 0134
 */
import type { PublicId } from "@stackra/contracts";
import { IntegrationEvent } from "@stackra/events";

/** Recorded after the transport returned its message id. */
export class MessageSent extends IntegrationEvent({ name: "message.sent" }) {
  /** The message's public id. */
  messageId!: PublicId<"msg">;

  /** The principal it was sent to. */
  principalId!: PublicId<"usr">;

  /** The producer's template key. */
  mail!: string;
}
