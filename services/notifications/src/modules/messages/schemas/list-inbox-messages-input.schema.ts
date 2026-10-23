/**
 * Stackra file contract:
 * Purpose: `ListInboxMessagesInput`: the input of `messages.inbox_message.list@1`: the cursor, the
 *          page size and the unread-only switch; the principal is the actor.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { CursorInput } from "@stackra/validation";

/** `cursor` and `limit` (1–100, default 20) come from CursorInput; the principal is the actor. */
export class ListInboxMessagesInput extends CursorInput {
  /** Only entries not read yet. */
  unreadOnly = false;
}
