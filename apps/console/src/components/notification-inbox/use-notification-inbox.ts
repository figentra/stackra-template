/**
 * Stackra file contract:
 * Purpose: the inbox's data: the signed-in user's notifications from the notifications service, a
 *          page at a time with a cursor, refreshed when a new one is broadcast, and the action that
 *          marks one read.
 * Boundary: one component's hook; the query and the action are the generated descriptors, so the
 *           server decides whose notifications are listed. Nothing is cached beyond the query
 *           cache. A failed mark-read is the caller's to show; the list is left as it was.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast), ADR 0079, HTTP conventions (cursor pagination)
 */
import { useAction, useInfiniteQuery } from "@stackra/clients/react";
import { useSubscription } from "@stackra/realtime/react";
import type { z } from "@stackra/schema";
import { Notifications, type NotificationView } from "#stackra/clients";

/** What the hook returns. */
export interface NotificationInboxState {
  /** The newest notifications first, across every page loaded; empty before the first answer. */
  readonly items: ReadonlyArray<z.infer<typeof NotificationView>>;
  /** The actor's unread count across the whole inbox, as the service counts it. */
  readonly unread: number;
  /** True until the first answer arrives. */
  readonly isLoading: boolean;
  /** The query's error, rendered by the error state; `null` when fine. */
  readonly error: unknown;
  /** True while the service has older notifications than the ones loaded. */
  readonly hasMore: boolean;
  /** True while the next page is on its way. */
  readonly isLoadingMore: boolean;
  /** Loads the next page after the last cursor. */
  readonly loadMore: () => void;
  /** Marks one notification read and refreshes the list; rejects when the service refuses. */
  readonly markRead: (notificationId: string) => Promise<void>;
  /** Asks again after an error. */
  readonly retry: () => void;
}

/** Ten at a time is what the sheet shows without scrolling. */
const PAGE_SIZE = 10;

/** The inbox list, live through the `NotificationCreated` broadcast. */
export function useNotificationInbox(): NotificationInboxState {
  const list = useInfiniteQuery(Notifications.queries.ListNotifications, { limit: PAGE_SIZE });
  const mark = useAction(Notifications.actions.MarkNotificationRead);
  useSubscription(Notifications.events.NotificationCreated, () => list.refetch());
  const pages = list.data?.pages ?? [];
  return {
    items: pages.flatMap((page) => page.items),
    unread: pages[0]?.unread ?? 0,
    isLoading: list.isPending,
    error: list.error ?? null,
    hasMore: list.hasNextPage,
    isLoadingMore: list.isFetchingNextPage,
    loadMore: () => void list.fetchNextPage(),
    markRead: async (notificationId) => {
      await mark.run({ notificationId });
      await list.refetch();
    },
    retry: () => void list.refetch(),
  };
}
