/**
 * Stackra file contract:
 * Purpose: the "Sales today" screen of the tenant admin: an L2 document composing the revenue
 *          widget and a table of pending orders. A document is data that only references registered
 *          code (ADR 0110, 0154); a tenant may override it with a document of the same shape in the
 *          page builder.
 * Boundary: a declaration only: no markup, no expressions, no logic, nothing runs at request time.
 *           The kind is `documents/` (`@Document`) so that "page" means a page component in an app.
 * Runtime: node
 * Governing contract: ADR 0110, 0154, 0164, guides/programming-model.mdx#documents
 */
import { Blocks, Document, DocumentLayout } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { RevenueTodayWidget } from "#modules/orders/widgets/revenue-today.widget";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";
import { CancelOrderAction } from "#modules/orders/actions/cancel-order.action";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";

/**
 * Route `/sales` in the tenant admin; blocks reference this module's widget and query by class, so
 * gen checks they exist and fit the slot. A sibling module's widget is internal to it (section 5).
 */
@Document({
  key: "sales_today",
  title: I18n.orders.documents.sales_today,
  path: "/sales",
  realms: [Realm.TenantAdmin],
  permission: OrderPermissions.read,
  navigation: { group: I18n.orders.nav.sales, icon: Icons.Chart, order: 10 },
  layout: DocumentLayout.TwoColumn,
  blocks: [
    Blocks.widget(RevenueTodayWidget, { column: 1 }),
    Blocks.table(ListOrdersQuery, {
      params: { status: OrderStatus.PendingPayment, limit: 10 },
      columns: ["id", "totals.totalMinor", "createdAt"],
      rowActions: [CancelOrderAction],
      column: "full",
    }),
  ],
})
export class SalesTodayDocument {}
