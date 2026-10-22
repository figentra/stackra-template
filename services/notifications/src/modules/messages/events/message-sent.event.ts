/**
 * Stackra file contract:
 * Purpose: the transport accepted a message; public so analytics can count deliveries without a
 *          call.
 * Boundary: one event per class; recorded on the Message by MessageService.send, once.
 * Runtime: isomorphic
 * Governing contract: ADR 0141, 0078, guides/programming-model.mdx#events
 */
import { Event, IntegrationEvent, z } from "@stackra/events";

/** `messages.message.sent.v1`; carries the mail key so consumers can count per kind. */
@Event({ name: "message.sent", public: true })
export class MessageSent extends IntegrationEvent(
  z.object({ messageId: z.string(), principalId: z.string(), mail: z.string() }),
) {}
