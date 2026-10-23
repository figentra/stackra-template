/**
 * Stackra file contract:
 * Purpose: runtime values of inventory, resolved per scope through the settings cascade (platform →
 *          tenant): the low-stock threshold and whether reservations may exceed stock.
 * Boundary: the module's one settings group; its key is the module key (`inventory`) and each field
 *           is a setting named by its path (`inventory.lowStockThreshold`). Two fields need no
 *           section. `@Setting` narrows each field: the threshold is the tenant's own and clients
 *           receive it (the POS colours a low count); backorders may be locked off by the platform
 *           and a change waits for a second approver, because it lets stock go negative. Gen writes
 *           the settings page, the `inventory.settings.*` operations and permissions, and the
 *           labels `inventory::settings.<path>.label|help`. StockService and the low-stock query
 *           read the resolved group at call time with `SettingsReader#get(InventorySettings)`.
 *           Never a secret.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 13, 16 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0108, ADR 0213 (settings v2)
 */
import { Setting, SettingScope, Settings } from "@stackra/settings";
import { Int } from "@stackra/validation";
import { I18n } from "#stackra/i18n";

/** What a tenant admin tunes about stock without a deploy. */
export class InventorySettings extends Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
  navigation: {
    group: I18n.inventory.nav.stock,
    icon: "warehouse",
    order: 30,
  },
}) {
  /** Available units at or below which `stock.low` fires and the widget lists the variant. */
  @Int({ min: 0 })
  @Setting({
    scopes: [SettingScope.Tenant],
    client: true,
  })
  lowStockThreshold = 5;

  /** Whether a reservation may exceed on-hand stock, letting `available` go negative. */
  @Setting({
    lockable: true,
    approval: true,
  })
  allowBackorders = false;
}
