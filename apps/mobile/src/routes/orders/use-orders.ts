/**
 * Stackra file contract:
 * Purpose: the order list's data: a cursor-paginated query with the optional status filter, served
 *          from the persisted cache first, refreshed on focus and whenever the realtime connection
 *          reports a paid order.
 * Boundary: data only; used by the orders page, so it sits in its route folder; a hook stays a
 *           plain function, and its result type is `types/orders-state.type.ts`. The subscription
 *           is the realtime package's `useSubscription` on the producer's event class, never a
 *           channel string.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0079, ADR 0225
 */
import { useInfiniteQuery } from "@stackra/clients/react";
import { useSubscription } from "@stackra/realtime/react";
import { Enum } from "@stackra/validation";
import type { OrdersState } from "#src/types/orders-state.type";
import { ListOrdersQuery, OrderPaid, OrderStatus } from "#stackra/clients/commerce";

/**
 * The list hook. The status filter is the table contract's own (`filter.status`); without a
 * route param every status is asked for, because the table's default filter shows only open and
 * paid orders and a phone's history shows them all.
 * @param status - optional status code from the route params
 */
export function useOrders(status?: OrderStatus): OrdersState {
  const query = useInfiniteQuery(
    ListOrdersQuery,
    { limit: 20, filter: { status: status ? [status] : Enum.values(OrderStatus) } },
    { getNextCursor: (page) => (page.hasMore ? page.nextCursor : undefined), refetchOnFocus: true },
  );
  // a paid order changes a row's status; refetch rather than patch, the list is short
  useSubscription(OrderPaid, () => query.refetch());
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
