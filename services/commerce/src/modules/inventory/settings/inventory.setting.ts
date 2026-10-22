/**
 * Stackra file contract:
 * Purpose: runtime, per-tenant inventory settings.
 * Boundary: read with `SettingsReader.for(InventorySettings)` in the current scope; validated by
 *           field decorators.
 * Runtime: node
 * Governing contract: ADR 0213, guides/programming-model.mdx#settings
 */
import { Bool, Int } from "@stackra/validation";
import { Setting, Settings, SettingScope } from "@stackra/settings";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";

/**
 * What a tenant admin tunes about stock without a deploy; read by StockService and the low-stock
 * query at call time.
 */
@Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
  page: { realms: [Realm.TenantAdmin], title: I18n.inventory.settings.title },
})
export class InventorySettings {
  /**
   * Available units at or below which `stock.low` fires and the widget lists the variant; 0 means
   * only when sold out.
   */
  @Int({ min: 0 }) @Setting() lowStockThreshold = 5;
  /**
   * When true, a reservation may exceed on-hand stock and `available` may go negative; off by
   * default.
   */
  @Bool() @Setting() allowBackorders = false;
}
