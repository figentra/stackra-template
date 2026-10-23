/**
 * Stackra file contract:
 * Purpose: the inbox's data: the signed-in user's notifications from the notifications service, a
 *          page at a time with a cursor, refreshed when a new one is broadcast, and the action that
 *          marks one read.
 * Boundary: one component's hook; the query and the action are the generated descriptors, so the
 *           server decides whose notifications are listed. Nothing is cached beyond the query
 *           cache. A failed mark-read is the caller's to show; the list is left as it was. The
 *           result type is `types/notification-inbox-state.type.ts`.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast), ADR 0079, HTTP conventions (cursor pagination)
 */
import { useAction, useInfiniteQuery } from "@stackra/clients/react";
import { useSubscription } from "@stackra/realtime/react";
import {
  InboxMessageCreated,
  ListInboxMessagesQuery,
  MarkInboxMessageReadAction,
} from "#stackra/clients/notifications";
import type { NotificationInboxState } from "#src/types/notification-inbox-state.type";

/** Ten at a time is what the sheet shows without scrolling. */
const PAGE_SIZE = 10;

/** The inbox list, live through `InboxMessageCreated`, broadcast to this user's sessions only. */
export function useNotificationInbox(): NotificationInboxState {
  const list = useInfiniteQuery(ListInboxMessagesQuery, { limit: PAGE_SIZE });
  const mark = useAction(MarkInboxMessageReadAction);
  useSubscription(InboxMessageCreated, () => list.refetch());
  const pages = list.data?.pages ?? [];
  return {
    items: pages.flatMap((page) => page.items),
    unread: pages[0]?.unread ?? 0,
    isLoading: list.isPending,
    error: list.error ?? null,
    hasMore: list.hasNextPage,
    isLoadingMore: list.isFetchingNextPage,
    loadMore: () => void list.fetchNextPage(),
    markRead: async (inboxMessageId) => {
      await mark.run({ inboxMessageId });
      await list.refetch();
    },
    retry: () => void list.refetch(),
  };
}
