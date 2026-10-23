/**
 * Stackra file contract:
 * Purpose: the orders tab root: a paginated list that refreshes itself when an order is paid.
 * Boundary: a route class: options only. The page's hook owns the infinite query (a cursor list is
 *           live state, not a one-shot load), so the route has no loader and states its permission
 *           itself, which also hides the tab from an actor without it; the server re-checks every
 *           call. `params` pre-applies a status from a widget or `acme://orders?status=paid`. The
 *           page is `orders.tsx`, bound by name; the title is `pages::orders.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decisions 11 and 12), ADR 0061,
 *                     ADR 0080
 */
import { HeaderStyle, Route } from "@stackra/navigation";
import { TabsLayout } from "#src/routes/tabs/tabs.layout";
import { OrdersFilter } from "#src/schemas/orders-filter.schema";
import { OrderPermissions } from "#stackra/clients/commerce";

/** The second tab; hidden for an actor without order read. */
export class OrdersRoute extends Route({
  path: "/orders",
  layout: TabsLayout,
  params: OrdersFilter,
  permission: OrderPermissions.read,
  tab: {
    order: 2,
    icon: "package",
  },
  chrome: { header: HeaderStyle.Large },
}) {}
