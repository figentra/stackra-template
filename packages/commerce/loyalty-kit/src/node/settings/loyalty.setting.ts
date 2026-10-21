/**
 * Stackra file contract:
 * Purpose: runtime, per-tenant loyalty settings: expiry window and tier thresholds.
 * Boundary: a settings group is a class (Spatie shape); field decorators validate, `@Setting`
 *           carries UI facts. Code reads the resolved group with
 *           `SettingsReader.for(LoyaltySettings)`; deploy-time values (the ledger driver, the earn
 *           rate) are config, not settings. No settings migrations: renames use `renamedFrom`.
 * Runtime: node
 * Governing contract: ADR 0108, 0213 (settings v2), ADR 0095 (field rules)
 */
import { Int } from "@stackra/validation";
import { Setting, SettingScope, Settings } from "@stackra/settings";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";

/**
 * What a tenant admin tunes without a deploy; the platform scope holds the defaults below. Gen
 * emits the settings page under `settings/loyalty_kit` in every panel hosting `Realm.TenantAdmin`,
 * gated by the generated `loyalty_kit.settings.update` permission. Labels default to
 * `loyalty_kit::settings.<field>`.
 */
@Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
  page: { realms: [Realm.TenantAdmin], title: I18n.loyalty_kit.settings.title },
})
export class LoyaltySettings {
  /**
   * Months after which unspent earned points expire; bounded so a typo cannot expire everything
   * overnight.
   */
  @Int({ min: 1, max: 60 }) @Setting() expiryMonths = 12;
  /** Balance at which an account becomes silver. */
  @Int({ min: 0 }) @Setting() silverFrom = 1_000;
  /** Balance at which an account becomes gold; the platform may lock it for franchise tenants. */
  @Int({ min: 0 }) @Setting({ lockable: true }) goldFrom = 5_000;
}
