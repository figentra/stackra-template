/**
 * Stackra file contract:
 * Purpose: the create-order sheet: variant (typed or scanned), quantity, optional loyalty points,
 *          submit.
 * Boundary: a route class: options only. `Presentation.Sheet` is an iOS 26 sheet with detents and a
 *           modal on Android. The page's hook runs the action, because an offline submit is queued
 *           rather than redirected, so the route has no `submit` and states its permission itself.
 *           The sheet starts empty or with the scanned variant. The page is `create-order.tsx`,
 *           bound by name; the title is `mobile::routes.create_order.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0059, ADR 0139, ADR 0165
 */
import { Presentation, Route } from "@stackra/navigation";
import { CreateOrderParams } from "#src/schemas/create-order-params.schema";
import { Commerce } from "#stackra/clients";

/** `/orders/new` sorts before `/orders/:orderId` in the generated linking. */
export class CreateOrderRoute extends Route({
  path: "/orders/new",
  params: CreateOrderParams,
  permission: Commerce.permissions.Order.create,
  presentation: Presentation.Sheet,
}) {}
