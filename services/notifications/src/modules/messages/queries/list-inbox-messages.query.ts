/**
 * Stackra file contract:
 * Purpose: `messages.inbox_message.list@1`: the acting principal's in-app inbox, newest first,
 *          cursor-paginated, optionally unread only, with the inbox-wide unread count.
 * Boundary: read only, no transaction. Narrowed to the actor in the query itself, so a principal
 *           never pages through anyone else's entries. The permission is derived
 *           (`InboxMessagePermissions.read`, L0, so also an MCP tool) and so is the endpoint
 *           (`GET /inbox-messages`). The console inbox and the mobile inbox page call it through
 *           the generated client (ADR 0223: the inbox lives in this service).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0155, cursor pagination in
 *                     the HTTP conventions
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, SortDirection } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import { CursorInput, Int, Page } from "@stackra/validation";
import type { InboxMessage } from "#modules/messages/models/inbox-message.model";
import { InboxMessageView } from "#modules/messages/schemas/inbox-message-view.schema";

/** `cursor` and `limit` (1–100, default 20) come from CursorInput; the principal is the actor. */
export class ListInboxMessagesInput extends CursorInput {
  /** Only entries not read yet. */
  unreadOnly = false;
}

/** One page: `items`, `nextCursor` (absent on the last page), `hasMore`, and the unread count. */
export class ListInboxMessagesOutput extends Page.of(InboxMessageView) {
  /** Unread entries in the whole inbox, not the page, so a client never sums pages to badge it. */
  @Int({ min: 0 })
  unread!: number;
}

/** Behind the console bell and the mobile inbox tab. */
export class ListInboxMessagesQuery extends Query({
  key: "inbox_message.list",
  actors: [ActorKind.User],
}) {
  /** @param inboxMessages - the generic repository of InboxMessage. */
  constructor(private readonly inboxMessages: Repository<InboxMessage>) {
    super();
  }

  /**
   * Fetches one row more than `limit` to learn `hasMore`; one count query gives the inbox-wide
   * `unread`, whatever page or filter was asked for.
   */
  async handle(input: ListInboxMessagesInput, ctx: QueryContext): Promise<ListInboxMessagesOutput> {
    const principalId = ctx.actor.id;
    const [rows, unread] = await Promise.all([
      this.inboxMessages.find(
        { principalId, ...(input.unreadOnly ? { readAt: null } : {}) },
        {
          limit: input.limit + 1,
          after: input.cursor,
          orderBy: { createdAt: SortDirection.Desc },
        },
      ),
      this.inboxMessages.count({ principalId, readAt: null }),
    ]);
    const hasMore = rows.length > input.limit;
    const page = rows.slice(0, input.limit);
    const last = page.at(-1);
    return ListInboxMessagesOutput.create({
      items: page.map((entry) => ({
        id: entry.id,
        kind: entry.kind,
        data: entry.data,
        createdAt: entry.createdAt,
        readAt: entry.readAt,
      })),
      hasMore,
      unread,
      ...(hasMore && last ? { nextCursor: last.id } : {}),
    });
  }
}
