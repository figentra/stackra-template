/**
 * Stackra file contract:
 * Purpose: the create-order form sheet: variant (typed or scanned), quantity, optional loyalty
 *          points, submit.
 * Boundary: options only. `presentation: FormSheet` is an iOS 26 sheet with detents, a modal on
 *           Android. The page's hook runs the action because an offline submit is queued rather
 *           than redirected, so the route has no `submits` and declares its permission itself. The
 *           sheet starts empty or with the scanned variant.
 * Runtime: react-native
 * Governing contract: ADR 0059, ADR 0139, ADR 0165
 */
import { Presentation, Route } from "@stackra/navigation";
import { CreateOrderPage } from "#src/components/pages/create-order";
import { CreateOrderParams } from "#src/schemas/create-order-params.schema";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/** `/orders/new` is declared before `/orders/:orderId` by gen's path sort. */
@Route({
  path: "/orders/new",
  auth: true,
  permission: Commerce.permissions.Order.create,
  params: CreateOrderParams,
  presentation: Presentation.FormSheet,
  header: { title: I18n.mobile.create_order.title },
  component: CreateOrderPage,
})
export class CreateOrderRoute {}
