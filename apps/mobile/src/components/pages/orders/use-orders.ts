/**
 * Stackra file contract:
 * Purpose: the order list's data: a cursor-paginated query with the optional status filter, served
 *          from the persisted cache first, refreshed on focus and whenever the realtime connection
 *          reports a paid order.
 * Boundary: data only; used by one page, so it sits beside it. The subscription is the realtime
 *           package's `useSubscription` on the producer's event descriptor, never a channel string.
 * Runtime: react-native
 * Governing contract: ADR 0079, ADR 0225
 */
import type { ClientError, QueryOutput } from "@stackra/clients";
import { useInfiniteQuery } from "@stackra/clients/react";
import { useSubscription } from "@stackra/realtime/react";
import { Commerce, type OrderStatus } from "#stackra/clients";

/** One order as the list query returns it. */
type OrderItem = QueryOutput<typeof Commerce.queries.ListOrders>["items"][number];

/** What the list page renders from. */
export interface OrdersState {
  /** Every loaded page's orders, flattened, newest first. */
  readonly orders: readonly OrderItem[];
  /** True only while the first page loads with an empty cache. */
  readonly isLoading: boolean;
  /** The error of the last fetch; `null` otherwise. */
  readonly error: ClientError | null;
  /** Whether another page exists. */
  readonly hasMore: boolean;
  /** Whether a background refresh or a next-page fetch is in flight. */
  readonly isFetching: boolean;
  /** Loads the next page; no-op while fetching or when `hasMore` is false. */
  readonly loadMore: () => void;
  /** Refetches from the first page (pull to refresh, retry). */
  readonly refresh: () => void;
}

/**
 * The list hook.
 * @param status - optional status case from the route params
 */
export function useOrders(status?: OrderStatus): OrdersState {
  const query = useInfiniteQuery(
    Commerce.queries.ListOrders,
    { limit: 20, status },
    { getNextCursor: (page) => (page.hasMore ? page.nextCursor : undefined), refetchOnFocus: true },
  );
  // a paid order changes a row's status; refetch rather than patch, the list is short
  useSubscription(Commerce.events.OrderPaid, () => query.refetch());
  return {
    orders: query.pages.flatMap((page) => page.items),
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage,
    isFetching: query.isFetching,
    loadMore: query.fetchNextPage,
    refresh: query.refetch,
  };
}
