/**
 * Stackra file contract:
 * Purpose: the long-press context menu of an order card: open the order, and cancel it when the
 *          actor may.
 * Boundary: a declaration; the iOS context menu and the Android popup are the navigation kit's.
 *           Items reference a route class and an action descriptor, so the cancel item carries the
 *           action's declared confirmation and is hidden when the policy or the permission refuses
 *           it.
 * Runtime: react-native
 * Governing contract: ADR 0061, ADR 0139
 */
import type { QueryOutput } from "@stackra/clients";
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { Target } from "@stackra/platform";
import { Icons } from "@stackra/ui/icons";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** Bound to `OrderCard` with `<ContextMenu menu={OrderCardMenu} value={order}>`. */
@Menu({ kind: MenuKind.Context, targets: [Target.Ios, Target.Android] })
export class OrderCardMenu {
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
