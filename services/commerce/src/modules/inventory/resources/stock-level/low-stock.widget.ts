/**
 * Stackra file contract:
 * Purpose: a dashboard tile listing variants at or below the low-stock threshold, refreshed live by
 *          `inventory.stock.low.v1`.
 * Boundary: a declaration; nothing runs at request time. A widget is a query bound to a display
 *           kind: the built-in List shows `variantId` with `available` beside it, so the service
 *           ships no React and no app must supply a renderer. Display field names are `keyof` the
 *           query's output. The key (`inventory.low_stock`) and the title
 *           (`inventory::widgets.low_stock.title`) are derived, and the permission is the query's
 *           (`inventory.stock.read`). `refreshOn` re-runs the query when the data-free broadcast
 *           arrives, so the tile updates without polling.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0164, ADR 0225 (broadcast)
 */
import { Widget, WidgetDisplay, WidgetSize } from "@stackra/panel";
import { Slots } from "#stackra/slots";
import { StockLow } from "#modules/inventory/events/stock-low.event";
import { ListLowStockQuery } from "#modules/inventory/queries/list-low-stock.query";

/** Shown in the main dashboard slot to everyone who may read stock; five levels at a time. */
export class LowStockWidget extends Widget({
  slot: Slots.Dashboard.Main,
  query: ListLowStockQuery,
  params: { limit: 5 },
  display: WidgetDisplay.list({
    primary: "variantId",
    secondary: "available",
  }),
  size: WidgetSize.Medium,
  refreshOn: [StockLow],
}) {}
