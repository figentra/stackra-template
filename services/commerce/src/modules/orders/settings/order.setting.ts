/**
 * Stackra file contract:
 * Purpose: runtime values of orders, resolved per scope through the settings cascade (platform →
 *          tenant).
 * Boundary: a settings group is a class (Spatie shape); field decorators validate, `@Setting`
 *           carries UI facts. Code reads the resolved group with
 *           `SettingsReader.for(OrderSettings)`; deploy-time values are config.
 * Runtime: node
 * Governing contract: ADR 0108, 0213 (settings v2), ADR 0095 (field rules),
 *                     guides/programming-model.mdx#settings
 */
import { Bool, Int } from "@stackra/validation";
import { Setting, Settings, SettingScope } from "@stackra/settings";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";

/**
 * A tenant admin changes these in the console without a deploy. Gen emits the settings page under
 * `settings/orders` in
 * every panel that hosts the listed realms, gated by the generated `orders.settings.update` permission, and the group's
 * JSON Schema into the
 * manifest. Labels default to `orders::settings.<field>` (snake_case of the field name).
 */
@Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
  page: { realms: [Realm.TenantAdmin], title: I18n.orders.settings.title },
})
export class OrderSettings {
  /**
   * Minutes an order may stay pending before the expiry job cancels it; bounded so a typo cannot
   * disable expiry.
   */
  @Int({ min: 5, max: 1440 })
  @Setting({ renamedFrom: "autoCancelMinutes" })
  autoCancelAfterMinutes = 30;
  /**
   * Whether a customer may cancel their own unpaid order; the platform may lock it off for
   * regulated tenants.
   */
  @Bool() @Setting({ lockable: true }) customersMayCancel = true;
}
