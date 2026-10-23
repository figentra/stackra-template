/**
 * Stackra file contract:
 * Purpose: the long-press context menu of an order card: open the order, and cancel it when the
 *          actor may.
 * Boundary: a menu of kind Context built from the closed item verbs (route, action); the iOS
 *           context menu and the Android popup are the navigation kit's. The cancel item names the
 *           action's generated client class, so it carries the action's declared confirmation and
 *           is hidden when the permission or the policy refuses it. Icons are `IconName` strings.
 *           The targets are the app's.
 * Runtime: react-native
 * Governing contract: ADR 0295 (decision 12), ADR 0294 (decision 16, as amended by programming
 *                     model v3.1, AGENTS.md: client classes, icon names), ADR 0061, ADR 0139
 */
import { Menu, type MenuBuilder, MenuKind } from "@stackra/navigation";
import { CancelOrderAction, type OrderView } from "#stackra/clients/commerce";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** Bound to `OrderCard` with `<ContextMenu menu={OrderCardMenu} value={order}>`. */
export class OrderCardMenu extends Menu({ kind: MenuKind.Context }) {
  /** Open first; cancel last and destructive, shown only when the actor may cancel this order. */
  items(m: MenuBuilder<OrderView>) {
    return [
      m.route(Routes.order_detail, {
        label: I18n.mobile.order_card.open,
        icon: "eye",
        params: (order) => ({ orderId: order.id }),
      }),
      m.action(CancelOrderAction, {
        label: I18n.mobile.order_card.cancel,
        icon: "circle-x",
        destructive: true,
        input: (order) => ({ orderId: order.id }),
      }),
    ];
  }
}
