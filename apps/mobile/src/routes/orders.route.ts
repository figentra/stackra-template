/**
 * Stackra file contract:
 * Purpose: the orders tab root: a paginated list that refreshes itself when an order is paid.
 * Boundary: options only. The page's hook owns the infinite query (a cursor list is live state, not
 *           a one-shot load), so the route neither prefetches nor loads and declares its permission
 *           itself; the server re-checks every call. `params` pre-applies a status from a widget or
 *           `stackra://orders?status=paid`.
 * Runtime: react-native
 * Governing contract: ADR 0061, ADR 0080
 */
import { Route } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { OrdersPage } from "#src/components/pages/orders";
import { TabsLayout } from "#src/routes/tabs.layout";
import { OrdersFilter } from "#src/schemas/orders-filter.schema";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/** The second tab; hidden for an actor without order read. */
@Route({
  path: "/orders",
  layout: TabsLayout,
  auth: true,
  permission: Commerce.permissions.Order.read,
  params: OrdersFilter,
  tab: { order: 2, icon: Icons.Package, label: I18n.mobile.tabs.orders, testId: "tab-orders" },
  header: { title: I18n.mobile.orders.title },
  component: OrdersPage,
})
export class OrdersRoute {}
