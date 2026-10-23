/**
 * Stackra file contract:
 * Purpose: one order: status, lines, totals with the extension-applied adjustments, and the cancel
 *          action when allowed. Reached by push, by deep link `acme://orders/<orderId>` and by the
 *          paid-order notification.
 * Boundary: a route class. `params` validates the id before anything runs; `loader` reads the order
 *           before the page mounts, served from the persisted cache first so a seen order renders
 *           offline, and the route's permission is derived from that query, so it states none.
 *           The page is `order-detail.tsx`, bound by name; its hook keeps the same query live. The
 *           title is `mobile::routes.order_detail.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0059, ADR 0082, ADR 0139
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { OrderDetailParams } from "#src/schemas/order-detail-params.schema";
import { Commerce } from "#stackra/clients";

/** A pushed screen on the root stack; `/orders/:orderId` sorts after `/orders/new` in linking. */
export class OrderDetailRoute extends Route({
  path: "/orders/:orderId",
  params: OrderDetailParams,
  cache: { ttl: "1h" },
}) {
  /** The order by its validated id; a refusal renders the route's error state. */
  override async loader(ctx: RouteContext<this>) {
    return { order: await ctx.query(Commerce.queries.GetOrder, { orderId: ctx.params.orderId }) };
  }
}
