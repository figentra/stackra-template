/**
 * Stackra file contract:
 * Purpose: runtime, per-tenant loyalty settings: the expiry window and the tier thresholds,
 *          resolved through the settings cascade (platform → tenant).
 * Boundary: the module's one settings group; its key is the package key (`loyalty_kit`) and each
 *           field is a setting named after the property (`loyalty_kit.expiryMonths`). Gen writes
 *           the settings page in the admin area and the `loyalty_kit.settings.update` permission;
 *           labels are the derived i18n keys `loyalty_kit::settings.loyalty_kit.<field>`. Code
 *           reads the resolved group with `SettingsReader#for(LoyaltyKitSettings)`; deploy-time
 *           values (the ledger driver, the earn rate) are config.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 13, 16 and 20), ADR 0108, ADR 0213 (settings v2)
 */
import { Setting, SettingScope, Settings } from "@stackra/settings";
import { Int } from "@stackra/validation";

/** What a tenant admin tunes without a deploy; the platform scope holds the defaults below. */
export class LoyaltyKitSettings extends Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
}) {
  /** Months after which unspent earned points expire; bounded, so a typo cannot expire all. */
  @Int({
    min: 1,
    max: 60,
  })
  expiryMonths = 12;

  /** Balance at which an account becomes silver. */
  @Int({ min: 0 })
  silverFrom = 1_000;

  /** Balance at which an account becomes gold; the platform may lock it for franchise tenants. */
  @Int({ min: 0 })
  @Setting({ lockable: true })
  goldFrom = 5_000;
}
