/**
 * Stackra file contract:
 * Purpose: the staff screens for orders in the admin area: a filterable list with saved views and
 *          export, the View page with the summary, the totals and the lines, and cancel on rows, on
 *          View and in bulk. Declared here, rendered by @stackra/panel.
 * Boundary: a declaration only (a service ships no client UI); gen runs each member once and
 *           records the tree in the manifest (`ui.resources`). `Resource<Order, OrderView>`: the
 *           model is the subject and OrderView is the row, because the list query returns views, so
 *           every table, view and entry key is a path of OrderView (`totals.totalMinor`) and gen
 *           fails on a key the row does not have. Pages follow from `operations`: List and View
 *           only; orders are placed by `order.create`, never by hand, so there is no Create or Edit
 *           page and no empty-state button. The table is a server contract: it compiles into the
 *           closed ListOrdersInput (a sort enum and typed filters), and every sortable or
 *           filterable key has an index in the orders migrations. Every button runs an Action and
 *           sits where its input shape puts it (a record id only: row, View; `.bulk()` adds the
 *           bulk bar, fanned out with the policy per order); its permission is its key's, and an L2
 *           verb confirms. Counts are estimated (`Count.Estimated`). Labels are the derived keys
 *           `orders::resources.order.*`; the notifications in this folder appear on the View page's
 *           Messages tab, and pages publish `Slots.Orders.Order.<Page>.<Place>` for widgets.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 11, 13 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1), ADR 0082 (API areas),
 *                     ADR 0139
 */
import { ApiArea, SortDirection } from "@stackra/contracts";
import {
  type Actions,
  Bind,
  DateRange,
  ExportFormat,
  type Infolist,
  type Relations,
  Resource,
  type Table,
  type Views,
} from "@stackra/panel";
import { I18n } from "#stackra/i18n";
import { CancelOrderAction } from "#modules/orders/actions/cancel-order.action";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { Order } from "#modules/orders/models/order.model";
import { GetOrderQuery } from "#modules/orders/queries/get-order.query";
import { ListOrderLinesQuery } from "#modules/orders/queries/list-order-lines.query";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";

/** Orders under Sales; the navigation badge counts the "awaiting payment" view. */
export class OrderResource extends Resource<Order, OrderView>({
  area: ApiArea.Admin,
  navigation: {
    group: I18n.orders.nav.sales,
    icon: "receipt",
    order: 20,
    badge: "awaiting_payment",
  },
  operations: {
    list: ListOrdersQuery,
    get: GetOrderQuery,
  },
}) {
  /**
   * Newest first. The status filter is pinned beside search and defaults to the open states, so the
   * Default view hides cancelled and expired orders; `createdAt` and the total sort on
   * `idx_orders_tenant_id_created_at` and `idx_orders_tenant_id_total_minor`.
   */
  override table(t: Table<OrderView>) {
    return t
      .columns((c) => [
        c.from("id").copyable(),
        c.from("status"),
        c.principal("customerId"),
        c.money("totals.totalMinor", { currency: "totals.currency" }).sortable(),
        c.count("lines"),
        c.from("createdAt").sortable(),
        c.from("paidAt").hidden(),
      ])
      .filters((f) => [
        f.from("status").default([OrderStatus.PendingPayment, OrderStatus.Paid]).pinned(),
        f.from("createdAt"),
        f.from("paidAt"),
        f.principal("customerId"),
      ])
      .defaultSort("createdAt", SortDirection.Desc);
  }

  /** Presets beside the Default view; users save their own and may share them with the tenant. */
  override views(v: Views<OrderView>) {
    return [
      v.view("awaiting_payment", { status: [OrderStatus.PendingPayment] }),
      v
        .view("paid_today", { status: [OrderStatus.Paid], paidAt: DateRange.today() })
        .sort("paidAt", SortDirection.Desc),
      v.view("closed", { status: [OrderStatus.Cancelled, OrderStatus.Expired] }),
    ];
  }

  /** The View page: the summary on the left, the totals in the side column. */
  override infolist(i: Infolist<OrderView>) {
    return i.entries((e) => [
      e.section("summary", [
        e.from("id").copyable(),
        e.from("status"),
        e.principal("customerId"),
        e.from("createdAt"),
        e.from("paidAt"),
      ]),
      e
        .section("totals", [
          e.money("totals.subtotalMinor", { currency: "totals.currency" }),
          e.list("totals.adjustments", ["label", "amountMinor"]),
          e.money("totals.totalMinor", { currency: "totals.currency" }),
        ])
        .aside(),
    ]);
  }

  /** The Lines tab: a table over ListOrderLinesQuery, whose `orderId` is bound from the record. */
  override relations(r: Relations<OrderView>) {
    return [
      r.table(ListOrderLinesQuery, (c) => [
        c.from("sku").copyable(),
        c.from("quantity"),
        c.money("unitPriceMinor", { currency: Bind.record("totals.currency") }),
        c.from("trackInventory"),
      ]),
    ];
  }

  /**
   * Cancel on a row, on View and in bulk (the policy decides per order, refusals are grouped by
   * code in the toast); export of the current view or the selection, queued, as CSV or XLSX.
   */
  override actions(a: Actions<OrderView, OrderView>) {
    return [
      a.run(CancelOrderAction).bulk(),
      a.export({ formats: [ExportFormat.Csv, ExportFormat.Xlsx] }),
    ];
  }
}
