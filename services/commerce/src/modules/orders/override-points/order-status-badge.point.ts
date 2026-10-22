/**
 * Stackra file contract:
 * Purpose: the override point "how an order status is drawn". The module declares the point and its
 *          props; an app binds a component to it with `@Override` in
 *          `overrides/orders/components/`; gen checks the key and types the props from this class.
 * Boundary: a declaration, no React. The default is the panel's badge with `OrderStatus` labels and
 *           colours. Declarations live in `override-points/` (`*.point.ts`); `overrides/` holds
 *           only bindings of other modules' points (ADR 0264).
 * Runtime: isomorphic
 * Governing contract: ADR 0234 d9 (amended), ADR 0164,
 *                     guides/programming-model.mdx#override-points, ADR 0231
 */
import { OverridePoint, PanelDefaults } from "@stackra/panel";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";

/** What a replacement receives. */
export interface OrderStatusBadgeProps {
  /** The status to draw. */
  readonly status: OrderStatus;
  /** Compact inside a table row, full label in an infolist. */
  readonly compact: boolean;
}

/**
 * Used by `c.custom("status", OrderStatusBadge)` in the resource; wire key
 * `orders.order_status_badge`.
 */
@OverridePoint({ key: "order_status_badge", default: PanelDefaults.EnumBadge })
export class OrderStatusBadge extends OverridePoint<OrderStatusBadgeProps> {}
