/**
 * Stackra file contract:
 * Purpose: runtime values of orders, resolved per scope through the settings cascade (platform →
 *          tenant).
 * Boundary: the module's one settings group; its key is the module key (`orders`) and each field
 *           is a setting named after the property (`orders.autoCancelAfterMinutes`). Gen writes
 *           the settings page in the admin area and the `orders.settings.update` permission; labels
 *           are the derived i18n keys `orders::settings.orders.<field>`. Code reads the resolved
 *           group with `SettingsReader#for(OrdersSettings)`; deploy-time values are config.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 13, 16 and 20), ADR 0108, ADR 0213 (settings v2)
 */
import { Setting, SettingScope, Settings } from "@stackra/settings";
import { Int, Renamed } from "@stackra/validation";

/** A tenant admin changes these in the console without a deploy. */
export class OrdersSettings extends Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
}) {
  /** Minutes an order may stay unpaid before the expiry job ends it; bounded against typos. */
  @Int({
    min: 5,
    max: 1440,
  })
  @Renamed("autoCancelMinutes")
  autoCancelAfterMinutes = 30;

  /** Whether a customer may cancel their own unpaid order; the platform may lock it off. */
  @Setting({ lockable: true })
  customersMayCancel = true;

  /** Whether new orders are taken; off pauses ordering while cancels and reads go on. */
  acceptingOrders = true;
}
