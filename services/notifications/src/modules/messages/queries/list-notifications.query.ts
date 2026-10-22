/**
 * Stackra file contract:
 * Purpose: `messages.notification.list`: the acting principal's in-app inbox, newest first,
 *          cursor-paginated, optionally unread only, with the inbox-wide unread count.
 * Boundary: read only, no transaction. Narrowed to the actor in the query itself, so a principal
 *           never pages through anyone else's entries. The console inbox component and the mobile
 *           inbox page call it through the generated client (ADR 0223: the inbox lives in this
 *           service).
 * Runtime: node
 * Governing contract: ADR 0098, http conventions (cursor pagination), ADR 0127
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import type { Notification } from "#modules/messages/models/notification.model";
import { NotificationPermissions } from "#modules/messages/permissions/notification.permission";
import { NotificationListFilter } from "#modules/messages/schemas/notification-list-filter.schema";
import { NotificationPage } from "#modules/messages/schemas/notification-page.schema";

/** Behind the console bell and the mobile inbox tab. */
@Query({
  key: "notification.list",
  input: NotificationListFilter,
  output: NotificationPage,
  permission: NotificationPermissions.read,
  actors: [ActorKind.User],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/notifications" })
export class ListNotificationsQuery {
  constructor(private readonly notifications: Repository<Notification>) {}

  /**
   * Fetches one row more than `limit` to learn `hasMore`; one count query gives the inbox-wide
   * `unread`, whatever page or filter was asked for.
   */
  async handle(input: NotificationListFilter, ctx: QueryContext): Promise<NotificationPage> {
    const principalId = ctx.actor.id;
    const [rows, unread] = await Promise.all([
      this.notifications.find(
        { principalId, ...(input.unreadOnly ? { readAt: null } : {}) },
        { limit: input.limit + 1, after: input.cursor, orderBy: { createdAt: "desc" } },
      ),
      this.notifications.count({ principalId, readAt: null }),
    ]);
    const page = rows.slice(0, input.limit);
    return {
      items: page.map((n) => ({
        id: n.id,
        kind: n.kind,
        data: n.data,
        createdAt: n.createdAt.toISOString(),
        readAt: n.readAt?.toISOString() ?? null,
      })),
      nextCursor: rows.length > input.limit ? page.at(-1)?.id : undefined,
      hasMore: rows.length > input.limit,
      unread,
    };
  }
}
