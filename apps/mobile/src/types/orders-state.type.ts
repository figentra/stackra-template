/**
 * Stackra file contract:
 * Purpose: what the orders list page renders from: the loaded orders, the loading, error and
 *          paging states, and the paging calls.
 * Boundary: a type only; `useOrders` returns it and the `Orders` page reads it. A row is the
 *           producer's `OrderView`, never re-declared.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: one
 *                     declaration per file), ADR 0079
 */
import type { ClientError } from "@stackra/clients";
import type { OrderView } from "#stackra/clients/commerce";

/** The result of `useOrders`. */
export interface OrdersState {
  /** Every loaded page's orders, flattened, newest first. */
  readonly orders: readonly OrderView[];
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
