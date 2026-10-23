/**
 * Stackra file contract:
 * Purpose: the inbox's data: the user's notifications, newest first, cursor-paginated, with the
 *          unread count.
 * Boundary: data only; used by the inbox page, so it sits in its route folder; a hook stays a plain
 *           function, and its result type is `types/inbox-state.type.ts`. Entries carry a kind and
 *           its data; the page renders the kind's label. `unread` is the service's inbox-wide
 *           count.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0062, ADR 0079
 */
import { useInfiniteQuery } from "@stackra/clients/react";
import type { InboxState } from "#src/types/inbox-state.type";
import { ListInboxMessagesQuery } from "#stackra/clients/notifications";

/** The inbox hook. */
export function useInbox(): InboxState {
  const query = useInfiniteQuery(
    ListInboxMessagesQuery,
    { limit: 20 },
    { getNextCursor: (page) => (page.hasMore ? page.nextCursor : undefined), refetchOnFocus: true },
  );
  return {
    entries: query.pages.flatMap((page) => page.items),
    unread: query.pages[0]?.unread ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    loadMore: query.fetchNextPage,
    refresh: query.refetch,
  };
}
