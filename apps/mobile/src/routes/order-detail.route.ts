/**
 * Stackra file contract:
 * Purpose: one order: status, lines, totals with the hook-applied adjustments, and the cancel
 *          action when allowed. Reached by push, by deep link `stackra://orders/<orderId>` and by
 *          the paid-order notification.
 * Boundary: options only. `prefetch` warms `GetOrder` from the validated params before the page
 *           mounts, served from the persisted cache first so a seen order renders offline; the
 *           route's permission is derived from that query, so it declares none.
 * Runtime: react-native
 * Governing contract: ADR 0059, ADR 0082, ADR 0139
 */
import { Presentation, Route } from "@stackra/navigation";
import { OrderDetailPage } from "#src/components/pages/order-detail";
import { OrderDetailParams } from "#src/schemas/order-detail-params.schema";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/**
 * A pushed card on the root stack; `/orders/:orderId` sorts after `/orders/new` in the generated
 * linking.
 */
@Route({
  path: "/orders/:orderId",
  auth: true,
  params: OrderDetailParams,
  prefetch: [Commerce.queries.GetOrder],
  presentation: Presentation.Card,
  header: { title: I18n.mobile.order.title },
  cache: { ttl: "1h" },
  component: OrderDetailPage,
})
export class OrderDetailRoute {}
