/**
 * Stackra file contract:
 * Purpose: a new entry landed in a principal's in-app inbox; broadcast to that principal's open
 *          sessions so the console bell and the mobile inbox refresh without polling.
 * Boundary: a private event (`DomainEvent`): it never leaves the service through the outbox. One
 *           event per class; recorded on the Notification by the inbox listener when it creates the
 *           entry. The channel is per principal, so no other user's session receives it.
 * Runtime: isomorphic
 * Governing contract: ADR 0141, ADR 0078 decision 3 (domain events are not versioned), ADR 0225
 *                     (broadcast), guides/programming-model.mdx#events
 */
import { DomainEvent, Event, z } from "@stackra/events";
import { NotificationKind } from "#modules/messages/enums/notification-kind.enum";
import { NotificationPermissions } from "#modules/messages/permissions/notification.permission";

/**
 * `messages.notification.created`, with no version because a domain event never leaves the
 * service; carries ids and the kind only, never the entry's data.
 */
@Event({
  name: "notification.created",
  public: false,
  broadcast: {
    channel: (e) => `principal.${e.data.principalId}.notifications`,
    permission: NotificationPermissions.read,
  },
})
export class NotificationCreated extends DomainEvent(
  z.object({
    notificationId: z.string(),
    principalId: z.string(),
    kind: NotificationKind.schema,
  }),
) {}
