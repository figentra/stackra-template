/**
 * Stackra file contract:
 * Purpose: a console tile listing variants at or below the low-stock threshold, refreshed live by
 *          `stock.low`.
 * Boundary: a declaration bound to a query by class, nothing runs at request time; the panel's
 *           generic list display, so no component and no override point. `display` field names are
 *           `keyof` the query output.
 * Runtime: node
 * Governing contract: ADR 0164, guides/programming-model.mdx#widgets
 */
import { Widget, WidgetSize } from "@stackra/panel";
import { Slots } from "#stackra/slots";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { ListLowStockQuery } from "#modules/inventory/queries/list-low-stock.query";
import { StockLow } from "#modules/inventory/events/stock-low.event";
import { StockPermissions } from "#modules/inventory/permissions/stock.permission";

/**
 * `refreshOn` re-runs the query when a `stock.low` broadcast arrives, so the tile updates without
 * polling.
 */
@Widget({
  title: I18n.inventory.widgets.low_stock,
  realms: [Realm.TenantAdmin],
  slot: Slots.Dashboard.Main,
  size: WidgetSize.Medium,
  query: ListLowStockQuery,
  params: { limit: 5 },
  display: { kind: "list", primary: "variantId", secondary: "available" },
  permission: StockPermissions.read,
  refreshOn: [StockLow],
})
export class LowStockWidget {}
