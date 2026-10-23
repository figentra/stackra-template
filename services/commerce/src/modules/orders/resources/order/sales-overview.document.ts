/**
 * Stackra file contract:
 * Purpose: the "Sales overview" dashboard of the admin area: the orders KPI band, then the orders
 *          awaiting payment, under one range picker that starts on the last 30 days.
 * Boundary: a document is a saved, tenant-editable tree that only references registered code
 *           (ADR 0110, 0154): no markup, no expressions, no logic. A Dashboard is always the
 *           12-column grid, places widget classes only (each tile has its own key, permission,
 *           refresh rule and library entry) and publishes `Slots.Orders.SalesOverview.Header|Main`,
 *           so a host module adds a package's widget without editing this file. The picker drives
 *           every tile whose query takes a TimeRangeInput; the others ignore it. The tenant edits a
 *           copy in the studio and users keep an overlay (move, resize, hide, add) they can reset;
 *           each tile runs as the viewer. The key (`orders.sales_overview`) and title
 *           (`orders::documents.sales_overview.title`) are derived; the page needs
 *           `orders.order.read`, the permission both tiles' queries share.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0110, ADR 0154, ADR 0164 (as amended for v3.1),
 *                     ADR 0270
 */
import { ApiArea } from "@stackra/contracts";
import { Blocks, Document, DocumentKind, TimeRange, WidgetSize } from "@stackra/panel";
import { I18n } from "#stackra/i18n";
import { AwaitingPaymentWidget } from "#modules/orders/resources/order/awaiting-payment.widget";
import { OrderKpisWidget } from "#modules/orders/resources/order/order-kpis.widget";

/** Route `/sales` in the admin area, listed under Sales before the orders list. */
export class SalesOverviewDocument extends Document({
  kind: DocumentKind.Dashboard,
  path: "/sales",
  area: ApiArea.Admin,
  navigation: {
    group: I18n.orders.nav.sales,
    icon: "chart-line",
    order: 10,
  },
  range: {
    ranges: [
      TimeRange.Today,
      TimeRange.Yesterday,
      TimeRange.Last7Days,
      TimeRange.Last30Days,
      TimeRange.ThisMonth,
      TimeRange.Custom,
    ],
    default: TimeRange.Last30Days,
  },
  blocks: [
    Blocks.widget(OrderKpisWidget),
    Blocks.widget(AwaitingPaymentWidget, { size: WidgetSize.Full }),
  ],
}) {}
