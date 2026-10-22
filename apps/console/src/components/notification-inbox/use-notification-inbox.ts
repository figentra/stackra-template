/**
 * Stackra file contract:
 * Purpose: the inbox's data: the signed-in user's notifications from the notifications service,
 *          refreshed when a new one is broadcast, and the action that marks one read.
 * Boundary: one component's hook; the query and the action are the generated descriptors, so the
 *           server decides whose notifications are listed. Nothing is cached beyond the query
 *           cache.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast), ADR 0079
 */
import { useAction, useQuery } from "@stackra/clients/react";
import { useSubscription } from "@stackra/realtime/react";
import type { z } from "@stackra/schema";
import { Notifications, type NotificationView } from "#stackra/clients";

/** What the hook returns. */
export interface NotificationInboxState {
  /** The newest notifications first; empty before the first answer. */
  readonly items: ReadonlyArray<z.infer<typeof NotificationView>>;
  /** The actor's unread count across the whole inbox, as the service counts it. */
  readonly unread: number;
  /** True until the first answer arrives. */
  readonly isLoading: boolean;
  /** The query's error, rendered by the error state; `null` when fine. */
  readonly error: unknown;
  /** Marks one notification read and refreshes the list. */
  readonly markRead: (notificationId: string) => Promise<void>;
  /** Asks again after an error. */
  readonly retry: () => void;
}

/** Ten at a time is what the sheet shows without scrolling. */
const PAGE_SIZE = 10;

/** The inbox list, live through the `NotificationCreated` broadcast. */
export function useNotificationInbox(): NotificationInboxState {
  const list = useQuery(Notifications.queries.ListNotifications, { limit: PAGE_SIZE });
  const mark = useAction(Notifications.actions.MarkNotificationRead);
  useSubscription(Notifications.events.NotificationCreated, () => list.refetch());
  const items = list.data?.items ?? [];
  return {
    items,
    unread: list.data?.unread ?? 0,
    isLoading: list.isPending,
    error: list.error ?? null,
    markRead: async (notificationId) => {
      await mark.run({ notificationId });
      await list.refetch();
    },
    retry: () => list.refetch(),
  };
}
