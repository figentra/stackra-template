/**
 * Stackra file contract:
 * Purpose: runtime values of inventory, resolved per scope through the settings cascade (platform →
 *          tenant).
 * Boundary: the module's one settings group; its key is the module key (`inventory`) and each
 *           field is a setting named after the property (`inventory.lowStockThreshold`). Gen writes
 *           the settings page in the admin area and the `inventory.settings.update` permission;
 *           labels are the derived i18n keys `inventory::settings.inventory.<field>`. StockService
 *           and the low-stock query read the resolved group at call time with
 *           `SettingsReader#for(InventorySettings)`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 13, 16 and 20), ADR 0108, ADR 0213 (settings v2)
 */
import { SettingScope, Settings } from "@stackra/settings";
import { Int } from "@stackra/validation";

/** What a tenant admin tunes about stock without a deploy. */
export class InventorySettings extends Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
}) {
  /** Available units at or below which `stock.low` fires and the widget lists the variant. */
  @Int({ min: 0 })
  lowStockThreshold = 5;

  /** Whether a reservation may exceed on-hand stock, letting `available` go negative. */
  allowBackorders = false;
}
