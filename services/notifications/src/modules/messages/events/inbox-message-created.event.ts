/**
 * Stackra file contract:
 * Purpose: the fact that a new entry landed in a principal's in-app inbox. Broadcast so the console
 *          bell and the mobile inbox refresh without polling; leaves through the outbox as
 *          `messages.inbox_message.created.v1`.
 * Boundary: an integration event recorded on the InboxMessage by the inbox listener that creates
 *           the entry. It is an integration event because only those may broadcast. The audience is
 *           the principal: only that principal's own sessions holding
 *           `messages.inbox_message.read` receive a data-free refresh, on
 *           `principal.{principalId}.messages`, never the payload, and refetch their own inbox; no
 *           other session of the tenant hears about one person's inbox. It carries ids and the
 *           kind only, never the entry's data.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141, ADR 0078, ADR 0225 (broadcast)
 */
import type { PublicId } from "@stackra/contracts";
import { BroadcastAudience, IntegrationEvent } from "@stackra/events";
import { InboxMessagePermissions } from "#modules/messages/access/inbox-message.permissions";
import type { InboxMessageKind } from "#modules/messages/enums/inbox-message-kind.enum";

/** Recorded once per created entry. */
export class InboxMessageCreated extends IntegrationEvent({
  name: "inbox_message.created",
  broadcast: {
    permission: InboxMessagePermissions.read,
    audience: BroadcastAudience.Principal,
  },
}) {
  /** The new entry. */
  inboxMessageId!: PublicId<"inm">;

  /** The principal whose inbox it is in; the broadcast goes to this principal's sessions only. */
  principalId!: PublicId<"usr">;

  /** What the entry is about. */
  kind!: InboxMessageKind;
}
