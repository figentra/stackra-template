/**
 * Stackra file contract:
 * Purpose: `NotificationPage`: one page of the inbox, newest first, plus the actor's total unread
 *          count for the bell and the tab badge.
 * Boundary: one schema class and its inferred type (ADR 0006). `unread` counts the whole inbox, not
 *           the page, so a client never sums pages to badge it.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, http conventions (cursor pagination),
 *                     guides/programming-model.mdx#schemas
 */
import { Page, z } from "@stackra/schema";
import { NotificationView } from "#modules/messages/schemas/notification-view.schema";

/** `{ items: NotificationView[], nextCursor?, hasMore, unread }`. */
export class NotificationPage extends Page(NotificationView, {
  unread: z.number().int().nonnegative(),
}) {}
