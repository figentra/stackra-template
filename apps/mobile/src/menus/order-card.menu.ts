/**
 * Stackra file contract:
 * Purpose: the long-press context menu of an order card: open the order, and cancel it when the
 *          actor may.
 * Boundary: a menu of kind Context built from the closed item verbs (route, action); the iOS
 *           context menu and the Android popup are the navigation kit's. The cancel item names the
 *           action's client descriptor, so it carries the action's declared confirmation and is
 *           hidden when the permission or the policy refuses it. The targets are the app's.
 * Runtime: react-native
 * Governing contract: ADR 0295 (decision 12), ADR 0294 (decision 16), ADR 0061, ADR 0139
 */
import type { QueryOutput } from "@stackra/clients";
import { Menu, type MenuBuilder, MenuKind } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** Bound to `OrderCard` with `<ContextMenu menu={OrderCardMenu} value={order}>`. */
export class OrderCardMenu extends Menu({ kind: MenuKind.Context }) {
  /** Open first; cancel last and destructive, shown only when the actor may cancel this order. */
  items(m: MenuBuilder<QueryOutput<typeof Commerce.queries.GetOrder>>) {
    return [
      m.route(Routes.order_detail, {
        label: I18n.mobile.order.open,
        icon: Icons.Eye,
        params: (order) => ({ orderId: order.id }),
      }),
      m.action(Commerce.actions.CancelOrder, {
        label: I18n.mobile.order.cancel,
        icon: Icons.XCircle,
        destructive: true,
        input: (order) => ({ orderId: order.id }),
      }),
    ];
  }
}
