/**
 * Stackra file contract:
 * Purpose: the staff screens for orders in the admin area: list, view, cancel. Declared here,
 *          rendered by @stackra/panel.
 * Boundary: a declaration only (a service ships no client UI). Pages follow from `operations`:
 *           List and View; there is no create or update operation, so no Create or Edit page,
 *           because orders are placed by `order.create`, never by hand. The notifications in this
 *           folder appear on the View page's Messages tab. Column and entry keys are `keyof
 *           Order`, so gen fails on a field the model does not have. The title is the derived i18n
 *           key `orders::resources.order.title`; the status column is the built-in enum column
 *           (labels and tones from OrderStatus).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 11, 13 and 16), ADR 0164 (panels are resources),
 *                     ADR 0082 (API areas), ADR 0139
 */
import { ApiArea, SortDirection } from "@stackra/contracts";
import {
  type Actions,
  type BulkActions,
  type Infolist,
  Resource,
  type Table,
} from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { CancelOrderAction } from "#modules/orders/actions/cancel-order.action";
import { Order } from "#modules/orders/models/order.model";
import { GetOrderQuery } from "#modules/orders/queries/get-order.query";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";

/** Row and bulk actions hide when the permission or the record policy refuses. */
export class OrderResource extends Resource(Order, {
  area: ApiArea.Admin,
  navigation: {
    group: I18n.orders.nav.sales,
    icon: Icons.Receipt,
    order: 20,
  },
  operations: {
    list: ListOrdersQuery,
    get: GetOrderQuery,
  },
}) {
  /** The list: newest first, money in each row's currency, filterable by status and date. */
  override table(t: Table<Order>) {
    return t
      .columns((c) => [
        c.text("id").copyable(),
        c.enum("status"),
        c.money("total").sortable(),
        c.dateTime("createdAt").sortable(),
      ])
      .filters((f) => [f.select("status"), f.dateRange("createdAt")])
      .defaultSort("createdAt", SortDirection.Desc);
  }

  /** The View page: the totals, each adjustment's label and amount, then the lines. */
  override infolist(i: Infolist<Order>) {
    return i.entries((e) => [
      e.enum("status"),
      e.money("subtotal"),
      e.list("adjustments", ["label", "amountMinor"]),
      e.money("total"),
      e.relation("lines"),
    ]);
  }

  /** Cancel on a row and on the View page; the record fills `orderId`. */
  override actions(a: Actions<Order>) {
    return [a.run(CancelOrderAction)];
  }

  /** Cancel many unpaid orders at once; each is still checked against the policy. */
  override bulkActions(b: BulkActions<Order>) {
    return [b.run(CancelOrderAction)];
  }
}
