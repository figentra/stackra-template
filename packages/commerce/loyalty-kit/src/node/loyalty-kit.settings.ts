/**
 * Stackra file contract:
 * Purpose: runtime loyalty settings a tenant admin tunes without a deploy: the expiry window and
 *          the tier thresholds, resolved through the settings cascade (platform → tenant).
 * Boundary: the module's one settings group; its key is the package key (`loyalty_kit`) and each
 *           field is a setting named by its path (`loyalty_kit.expiryMonths`,
 *           `loyalty_kit.tiers.goldFrom`). A field typed by a schema class is a section, one card
 *           on the page, one level deep; its defaults are the section class's initializers.
 *           `@Setting` narrows one field: `lockable` lets the platform pin the value for every
 *           tenant, `approval` makes a change wait for a second holder of
 *           `loyalty_kit.settings.approve`. `rules(r)` is the cross-field check, run on client and
 *           server. Gen writes the settings page in the admin area, the get, update, history,
 *           revert and approve operations, their permissions and the `settings.changed.v1` event;
 *           labels are `loyalty_kit::settings.<path>.label`. Code reads the resolved group with
 *           `SettingsReader#get(LoyaltyKitSettings)`, which caches it per tenant version and drops
 *           it on `settings.changed.v1`, so no cache module is imported. Never a secret;
 *           deploy-time values (the ledger driver, the earn rate) are config.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0108 and ADR 0213 (settings, as
 *                     amended by programming model v3.1, AGENTS.md)
 */
import { Setting, SettingScope, Settings, type SettingsRules } from "@stackra/settings";
import { Int } from "@stackra/validation";
import type { LoyaltyTierSettings } from "#node/schemas/loyalty-tier-settings.schema";

/** The platform scope holds the defaults below; a tenant overrides what is not locked. */
export class LoyaltyKitSettings extends Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
}) {
  /** Months after which unspent earned points expire; bounded, so a typo cannot expire all. */
  @Int({
    min: 1,
    max: 60,
  })
  @Setting({ lockable: true })
  expiryMonths = 12;

  /** The tier thresholds; changing a member benefit needs a second admin's approval. */
  @Setting({ approval: true })
  tiers!: LoyaltyTierSettings;

  /** Silver must start below gold, or no account could ever be silver. */
  override rules(r: SettingsRules<LoyaltyKitSettings>) {
    return [r.lessThan("tiers.silverFrom", "tiers.goldFrom")];
  }
}
