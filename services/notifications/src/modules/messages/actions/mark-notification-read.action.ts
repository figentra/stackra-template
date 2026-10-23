/**
 * Stackra file contract:
 * Purpose: `messages.notification.mark_read@1`: mark one of the actor's own inbox entries read.
 * Boundary: an idempotent state change (PUT): marking a read entry again keeps its first `readAt`.
 *           Narrowed to the actor in the lookup itself, so another principal's entry is a not-found
 *           refusal, never a permission one. The key's verb is not a permission verb, so the
 *           permission is named (`NotificationPermissions.update`); the path is kept as
 *           `PUT /notifications/:notificationId/read` instead of the derived one. It reads through
 *           the generic Notification repository: there are no named reads to fold into a service.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16 and 21), ADR 0098, ADR 0140, PUT for idempotent
 *                     state changes in the HTTP conventions
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, HttpMethod, type PublicId } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import { Schema } from "@stackra/validation";
import { NotificationPermissions } from "#modules/messages/access/notification.permissions";
import { NotificationNotFoundError } from "#modules/messages/errors/notification-not-found.error";
import type { Notification } from "#modules/messages/models/notification.model";
import { NotificationView } from "#modules/messages/schemas/notification-view.schema";

/** The entry to mark read, taken from the path; the principal is the actor, never an input. */
export class MarkNotificationReadInput extends Schema {
  /** The entry's public id. */
  notificationId!: PublicId<"ntf">;
}

/** Behind the inbox's "Mark read" button. */
export class MarkNotificationReadAction extends Action({
  key: "notification.mark_read",
  permission: NotificationPermissions.update,
  actors: [ActorKind.User],
  endpoint: {
    method: HttpMethod.Put,
    path: "/notifications/:notificationId/read",
  },
}) {
  /** @param notifications - the generic repository of Notification. */
  constructor(private readonly notifications: Repository<Notification>) {
    super();
  }

  /**
   * Stamps `readAt` with the pipeline clock once; returns the entry as the inbox renders it.
   * @throws NotificationNotFoundError when the actor has no entry with that id.
   */
  async handle(input: MarkNotificationReadInput, ctx: ActionContext): Promise<NotificationView> {
    const { notificationId } = input;
    const entry = await this.notifications.findOne({
      id: notificationId,
      principalId: ctx.actor.id,
    });
    if (!entry) throw NotificationNotFoundError.create({ notificationId });
    entry.readAt ??= ctx.now();
    return NotificationView.create({
      id: entry.id,
      kind: entry.kind,
      data: entry.data,
      createdAt: entry.createdAt,
      readAt: entry.readAt,
    });
  }
}
