/**
 * Stackra file contract:
 * Purpose: the inbox's data: the user's notifications, newest first, cursor-paginated, with the
 *          unread count.
 * Boundary: data only; used by the inbox page, so it sits in its route folder. Entries carry a kind
 *           and its data; the page renders the kind's label. `unread` is the service's inbox-wide
 *           count.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0062, ADR 0079
 */
import type { ClientError, QueryOutput } from "@stackra/clients";
import { useInfiniteQuery } from "@stackra/clients/react";
import { Notifications } from "#stackra/clients";

/** One inbox entry as the list query returns it. */
type InboxEntry = QueryOutput<typeof Notifications.queries.ListNotifications>["items"][number];

/** What the inbox page renders from. */
export interface InboxState {
  /** Every loaded page's entries, flattened. */
  readonly entries: readonly InboxEntry[];
  /** Unread entries across all pages, as the service counts them. */
  readonly unread: number;
  /** True only while the first page loads with an empty cache. */
  readonly isLoading: boolean;
  /** The error of the last fetch; `null` otherwise. */
  readonly error: ClientError | null;
  /** Loads the next page; no-op while fetching or at the end. */
  readonly loadMore: () => void;
  /** Refetches from the first page. */
  readonly refresh: () => void;
}

/** The inbox hook. */
export function useInbox(): InboxState {
  const query = useInfiniteQuery(
    Notifications.queries.ListNotifications,
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
