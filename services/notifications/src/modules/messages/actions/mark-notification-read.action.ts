/**
 * Stackra file contract:
 * Purpose: `messages.notification.mark_read`: mark one of the actor's own inbox entries read.
 * Boundary: an idempotent state transition (PUT): marking a read entry again keeps its first
 *           `readAt`. Narrowed to the actor in the lookup itself, so another principal's entry is a
 *           not-found refusal, never a permission one.
 * Runtime: node
 * Governing contract: ADR 0098, http conventions (PUT for idempotent transitions), ADR 0140
 */
import { Action, type ActionContext, AsEndpoint } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import { Repository } from "@stackra/database";
import { Notification } from "#modules/messages/models/notification.model";
import { NotificationPermissions } from "#modules/messages/permissions/notification.permission";
import { MarkNotificationReadInput } from "#modules/messages/schemas/mark-notification-read-input.schema";
import { NotificationView } from "#modules/messages/schemas/notification-view.schema";
import { NotificationNotFoundError } from "#modules/messages/errors/notification-not-found.error";

/** Behind the console inbox's "Mark read" button. */
@Action({
  key: "notification.mark_read",
  input: MarkNotificationReadInput,
  output: NotificationView,
  permission: NotificationPermissions.update,
  actors: [ActorKind.User],
})
@AsEndpoint({ method: HttpMethod.Put, path: "/notifications/:notificationId/read" })
export class MarkNotificationReadAction {
  constructor(private readonly notifications: Repository<Notification>) {}

  /**
   * Stamps `readAt` with the pipeline clock once; returns the entry as the inbox renders it.
   * @throws NotificationNotFoundError when the actor has no entry with that id.
   */
  async handle(input: MarkNotificationReadInput, ctx: ActionContext): Promise<NotificationView> {
    const entry = await this.notifications.findOne({
      id: input.notificationId,
      principalId: ctx.actor.id,
    });
    if (!entry) throw new NotificationNotFoundError(input.notificationId);
    entry.readAt ??= ctx.now();
    return {
      id: entry.id,
      kind: entry.kind,
      data: entry.data,
      createdAt: entry.createdAt.toISOString(),
      readAt: entry.readAt.toISOString(),
    };
  }
}
