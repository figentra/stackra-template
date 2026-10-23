/**
 * Stackra file contract:
 * Purpose: the "Sales today" dashboard of the admin area: the revenue widget beside a table of
 *          pending orders.
 * Boundary: a document is a saved, tenant-editable block tree that only references registered code
 *           (ADR 0110, 0154): no markup, no expressions, no logic. A tenant may replace it with a
 *           document of the same kind and path in the page builder. The key
 *           (`orders.sales_today`) and the title (`orders::documents.sales_today.title`) are
 *           derived; the permission is the read permission of the blocks' query. Blocks reference
 *           this module's widget and query by class, so gen checks that they exist and fit.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0110, ADR 0154, ADR 0164, ADR 0270
 */
import { ApiArea } from "@stackra/contracts";
import { Blocks, Document, DocumentKind, DocumentLayout } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { CancelOrderAction } from "#modules/orders/actions/cancel-order.action";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";
import { RevenueTodayWidget } from "#modules/orders/resources/order/revenue-today.widget";

/** Route `/sales` in the admin area, listed under Sales before the orders list. */
export class SalesTodayDocument extends Document({
  kind: DocumentKind.Dashboard,
  path: "/sales",
  area: ApiArea.Admin,
  navigation: {
    group: I18n.orders.nav.sales,
    icon: Icons.Chart,
    order: 10,
  },
  layout: DocumentLayout.TwoColumn,
  blocks: [
    Blocks.widget(RevenueTodayWidget, { column: 1 }),
    Blocks.table(ListOrdersQuery, {
      params: {
        status: OrderStatus.PendingPayment,
        limit: 10,
      },
      columns: ["id", "totals.totalMinor", "createdAt"],
      rowActions: [CancelOrderAction],
      column: "full",
    }),
  ],
}) {}
