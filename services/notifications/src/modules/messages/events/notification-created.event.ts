/**
 * Stackra file contract:
 * Purpose: the fact that a new entry landed in a principal's in-app inbox. Broadcast so the console
 *          bell and the mobile inbox refresh without polling; leaves through the outbox as
 *          `messages.notification.created.v1`.
 * Boundary: an integration event recorded on the Notification by the inbox listener that creates
 *           the entry. It is an integration event because only those may broadcast: a session
 *           holding `messages.notification.read` receives a data-free refresh on
 *           `tenant.{tenantId}.messages`, never the payload, and refetches its own inbox, which the
 *           list query narrows to the actor. It carries ids and the kind only, never the entry's
 *           data.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141, ADR 0078, ADR 0225 (broadcast)
 */
import type { PublicId } from "@stackra/contracts";
import { IntegrationEvent } from "@stackra/events";
import { NotificationPermissions } from "#modules/messages/access/notification.permissions";
import type { NotificationKind } from "#modules/messages/enums/notification-kind.enum";

/** Recorded once per created entry. */
export class NotificationCreated extends IntegrationEvent({
  name: "notification.created",
  broadcast: NotificationPermissions.read,
}) {
  /** The new entry. */
  notificationId!: PublicId<"ntf">;

  /** The principal whose inbox it is in. */
  principalId!: PublicId<"usr">;

  /** What the entry is about. */
  kind!: NotificationKind;
}
