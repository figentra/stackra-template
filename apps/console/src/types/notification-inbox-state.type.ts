/**
 * Stackra file contract:
 * Purpose: `NotificationInboxState`: what `useNotificationInbox` returns to the inbox sheet.
 * Boundary: a type only, in the app's `types/` group so the hook file holds one declaration; the
 *           entries are the notifications service's generated view type.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file)
 */
import type { InboxMessageView } from "#stackra/clients/notifications";

/** The inbox's entries, paging state and the two calls the sheet makes. */
export interface NotificationInboxState {
  /** The newest notifications first, across every page loaded; empty before the first answer. */
  readonly items: readonly InboxMessageView[];
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
  readonly markRead: (inboxMessageId: string) => Promise<void>;
  /** Asks again after an error. */
  readonly retry: () => void;
}
