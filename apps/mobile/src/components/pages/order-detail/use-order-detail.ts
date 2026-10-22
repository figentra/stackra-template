/**
 * Stackra file contract:
 * Purpose: one order's live data (warmed by the route's `prefetch`) and its cancel action, with the
 *          confirmation the action declares. Used by one page, so it sits beside it.
 * Boundary: data and the one write. The confirmation text is the service's key
 *           (`I18n.orders.order.cancel_confirm`, shortened by `assets/overrides/orders/`); the client
 *           hook shows it before calling (ADR 0139). Cancel is `OfflineMode.Online` in
 *           `#stackra/offline`, so it refuses at once without a connection.
 * Runtime: react-native
 * Governing contract: ADR 0059, ADR 0079, ADR 0139
 */
import type { ClientError, QueryOutput } from "@stackra/clients";
import { useAction, useQuery } from "@stackra/clients/react";
import { Commerce } from "#stackra/clients";

/** What the detail page renders from and calls. */
export interface OrderDetailState {
  /** The order; `undefined` only while a cold cache waits for the first answer. */
  readonly order: QueryOutput<typeof Commerce.queries.GetOrder> | undefined;
  /** The error of the last fetch; `null` otherwise. */
  readonly error: ClientError | null;
  /** Refetches the order. */
  readonly refresh: () => void;
  /**
   * Whether the actor may cancel this order: awaiting payment, and allowed by permission and
   * policy.
   */
  readonly canCancel: boolean;
  /** Runs the cancel after the declared confirmation. */
  readonly cancel: () => void;
  /** Whether the cancel is in flight. */
  readonly isCancelling: boolean;
}

/**
 * The detail hook.
 * @param orderId - the public id from the route params
 */
export function useOrderDetail(orderId: string): OrderDetailState {
  const query = useQuery(Commerce.queries.GetOrder, { orderId }, { refetchOnFocus: true });
  const cancel = useAction(Commerce.actions.CancelOrder, {
    invalidates: [Commerce.queries.GetOrder, Commerce.queries.ListOrders],
  });
  const order = query.data;
  return {
    order,
    error: query.error,
    refresh: query.refetch,
    canCancel: order?.status === Commerce.enums.OrderStatus.PendingPayment && cancel.isAllowed,
    cancel: () => void cancel.run({ orderId }),
    isCancelling: cancel.isPending,
  };
}
