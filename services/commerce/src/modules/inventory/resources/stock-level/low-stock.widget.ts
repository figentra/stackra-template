/**
 * Stackra file contract:
 * Purpose: a dashboard tile listing variants at or below the low-stock threshold, refreshed live by
 *          `inventory.stock.low.v1`.
 * Boundary: a declaration; gen runs `display` once and records the tree in the manifest. The query
 *           is the type argument (`Widget<ListLowStockQuery>`), so the list's paths are checked
 *           against ListLowStockOutput. The built-in List display shows each level's variant with
 *           its location and available units, so the service ships no React. It sits in the home
 *           dashboard's Main grid at medium width. ListLowStockQuery is uncached (a count a person
 *           just adjusted must show at once), so this is the one place the refresh is written:
 *           `refreshOn` re-runs the query when the data-free `stock.low` broadcast arrives. The key
 *           (`inventory.low_stock`) and labels (`inventory::widgets.low_stock.*`) are derived; the
 *           permission is the query's (`inventory.stock.read`).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1), ADR 0225 (broadcast)
 */
import { type Display, Widget, WidgetSize } from "@stackra/panel";
import { Slots } from "#stackra/slots";
import { StockLow } from "#modules/inventory/events/stock-low.event";
import type { ListLowStockQuery } from "#modules/inventory/queries/list-low-stock.query";
import type { ListLowStockOutput } from "#modules/inventory/schemas/list-low-stock-output.schema";

/** Shown to everyone who may read stock; five levels at a time. */
export class LowStockWidget extends Widget<ListLowStockQuery>({
  slot: Slots.Dashboard.Main,
  size: WidgetSize.Medium,
  order: 20,
  params: { limit: 5 },
  refreshOn: [StockLow],
}) {
  /** Variant first, its location and the units still sellable beside it. */
  display(d: Display<ListLowStockOutput>) {
    return d
      .list("items", { primary: "variantId", secondary: "locationId", meta: "available" })
      .limit(5);
  }
}
