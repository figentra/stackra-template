/**
 * Stackra file contract:
 * Purpose: `ListInboxMessagesOutput`: the output of `messages.inbox_message.list@1`: one page of
 *          entries plus the inbox-wide unread count.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Int, Page } from "@stackra/validation";
import { InboxMessageView } from "#modules/messages/schemas/inbox-message-view.schema";

/** One page: `items`, `nextCursor` (absent on the last page), `hasMore`, and the unread count. */
export class ListInboxMessagesOutput extends Page.of(InboxMessageView) {
  /** Unread entries in the whole inbox, not the page, so a client never sums pages to badge it. */
  @Int({ min: 0 })
  unread!: number;
}
