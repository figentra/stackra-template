/**
 * Stackra file contract:
 * Purpose: the console screen for orders: list, detail, cancel. Declared here, rendered by
 *          @stackra/panel.
 * Boundary: a declaration only (a service ships no client UI). Builder methods are used because
 *           table and infolist are deep, repeated structures; everything else on a resource is a
 *           decorator option. It targets realms, never an app's panels: gen places it in every
 *           panel that hosts `Realm.TenantAdmin` or `Realm.Customer` (ADR 0164).
 * Runtime: node
 * Governing contract: ADR 0164 (panels are resources), ADR 0139,
 *                     guides/programming-model.mdx#resources
 */
import { Infolist, Resource, Table } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { Order } from "#modules/orders/models/order.model";
import { CancelOrderAction } from "#modules/orders/actions/cancel-order.action";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";
import { OrderStatusBadge } from "#modules/orders/override-points/order-status-badge.point";

/**
 * No `form`: orders are created by `order.create`, never by hand. Gen fails if a row action's
 * permission is not in
 * the manifest or a column names a field the model does not have (column keys are `keyof Order`).
 */
@Resource(Order, {
  label: I18n.orders.resource.orders,
  navigation: { group: I18n.orders.nav.sales, icon: Icons.Receipt, order: 20 },
  realms: [Realm.TenantAdmin, Realm.Customer],
  list: ListOrdersQuery, // the query behind the table; the `@Crud` list is the default when omitted
})
export class OrderResource extends Resource<Order> {
  /**
   * The list: newest first, money formatted in each row's currency, cancel as a row and bulk action
   * (permission-gated).
   */
  table(t: Table<Order>) {
    return t
      .columns((c) => [
        c.text("id").copyable(),
        c.custom("status", OrderStatusBadge),
        c.money("totalMinor", { currency: "currency" }).sortable(),
        c.dateTime("createdAt").sortable(),
      ])
      .filters((f) => [f.select("status"), f.dateRange("createdAt")])
      .defaultSort("createdAt", "desc")
      .rowActions([CancelOrderAction])
      .bulkActions([CancelOrderAction]);
  }

  /**
   * The detail view: the totals breakdown and the lines; adjustments are listed with their label
   * and amount.
   */
  infolist(i: Infolist<Order>) {
    return i.entries((e) => [
      e.custom("status", OrderStatusBadge),
      e.money("subtotalMinor"),
      e.list("adjustments", ["label", "amountMinor"]),
      e.money("totalMinor"),
      e.relation("lines"),
    ]);
  }
}
