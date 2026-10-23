/**
 * Stackra file contract:
 * Purpose: what the inbox page renders from: the loaded entries, the unread count, the loading and
 *          error states, and the paging calls.
 * Boundary: a type only; `useInbox` returns it and the `Inbox` page reads it. An entry is the
 *           producer's `InboxMessageView`, never re-declared.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: one
 *                     declaration per file), ADR 0062
 */
import type { ClientError } from "@stackra/clients";
import type { InboxMessageView } from "#stackra/clients/notifications";

/** The result of `useInbox`. */
export interface InboxState {
  /** Every loaded page's entries, flattened. */
  readonly entries: readonly InboxMessageView[];
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
