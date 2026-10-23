/**
 * Stackra file contract:
 * Purpose: the customer-portal "My orders" page: the customer's own orders, newest first, with
 *          their status, total and date.
 * Boundary: a document is a saved, tenant-editable block tree that only references registered code
 *           (ADR 0110, 0154): no markup, no expressions, no logic. It is in the app area, so the
 *           console's customer portal hosts it; OrderResource stays the staff surface of the admin
 *           area, because a resource has one area. The table runs ListOrdersQuery, which narrows a
 *           customer to their own rows in the query itself, so the page never lists another
 *           customer's order. The key (`orders.my_orders`) and the title
 *           (`orders::documents.my_orders.title`) are derived; the permission is the read
 *           permission of the blocks' query.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0110, ADR 0154, ADR 0164, ADR 0082
 *                     (API areas)
 */
import { ApiArea } from "@stackra/contracts";
import { Blocks, Document, DocumentKind, DocumentLayout } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";

/** Route `/orders` in the app area, listed under Orders. */
export class MyOrdersDocument extends Document({
  kind: DocumentKind.Page,
  path: "/orders",
  area: ApiArea.App,
  navigation: {
    group: I18n.orders.nav.orders,
    icon: Icons.Receipt,
    order: 10,
  },
  layout: DocumentLayout.SingleColumn,
  blocks: [
    Blocks.table(ListOrdersQuery, {
      params: {
        limit: 20,
      },
      columns: ["id", "status", "totals.totalMinor", "createdAt"],
    }),
  ],
}) {}
