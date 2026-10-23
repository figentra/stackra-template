/**
 * Stackra file contract:
 * Purpose: one order's live data (read first by the route's loader) and its cancel action, with the
 *          confirmation the action declares. Used by the detail page, so it sits in its route
 *          folder.
 * Boundary: data and the one write; a hook stays a plain function, and its result type is
 *           `types/order-detail-state.type.ts`. The confirmation text is the service's derived key
 *           (`orders::actions.order.cancel.confirm`, shortened by this app's override under
 *           `src/overrides/commerce/orders/`); the client hook shows it before calling (ADR 0139).
 *           Cancel is online-only in `#stackra/offline`, so it refuses at once without a
 *           connection.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0059, ADR 0079, ADR 0139
 */
import { useAction, useQuery } from "@stackra/clients/react";
import type { PublicId } from "@stackra/contracts";
import type { OrderDetailState } from "#src/types/order-detail-state.type";
import {
  CancelOrderAction,
  GetOrderQuery,
  ListOrdersQuery,
  OrderStatus,
} from "#stackra/clients/commerce";

/**
 * The detail hook.
 * @param orderId - the public id from the route params
 */
export function useOrderDetail(orderId: PublicId<"ord">): OrderDetailState {
  const query = useQuery(GetOrderQuery, { orderId }, { refetchOnFocus: true });
  const cancel = useAction(CancelOrderAction, { invalidates: [GetOrderQuery, ListOrdersQuery] });
  const order = query.data;
  return {
    order,
    error: query.error,
    refresh: query.refetch,
    canCancel: order?.status === OrderStatus.PendingPayment && cancel.isAllowed,
    cancel: () => void cancel.run({ orderId }),
    isCancelling: cancel.isPending,
  };
}
