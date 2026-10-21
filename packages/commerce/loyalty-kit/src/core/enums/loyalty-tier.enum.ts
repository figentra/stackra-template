/**
 * Stackra file contract:
 * Purpose: the member tiers, lowest first, each with the earn multiplier the tier-multiplier hook
 *          applies.
 * Boundary: a house enum (class, ADR 0128 d1 as amended): one case per static member; `value` is
 *           the wire and column string, `label` a typed i18n key, `meta.multiplier` what the hook
 *           needs. The `enum` keyword stays banned. Code compares against `LoyaltyTier.Gold`, never
 *           a bare string.
 * Runtime: isomorphic
 * Governing contract: ADR 0128 (amended: class enums), ADR 0231 (snake_case codes)
 */
import { Tone } from "@stackra/contracts";
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/**
 * `LoyaltyTier.from("gold")` returns the singleton `LoyaltyTier.Gold`, so cases compare by
 * identity. `LoyaltyTier.schema` is the Zod codec (wire string ↔ case) DTOs use;
 * `LoyaltyTier.values()` feeds a select.
 *
 * @example
 * LoyaltyTier.Gold.meta.multiplier;   // 200
 * LoyaltyTier.tryFrom("platinum");    // undefined
 */
export class LoyaltyTier extends Enum<LoyaltyTier> {
  /** Every new member; earns the base rate (×1.0). */
  static readonly Bronze = LoyaltyTier.case("bronze", {
    label: I18n.loyalty_kit.tiers.bronze,
    color: Tone.Default,
    multiplier: 100,
  });
  /** Reached at `LoyaltySettings.silverFrom` points; earns ×1.5. */
  static readonly Silver = LoyaltyTier.case("silver", {
    label: I18n.loyalty_kit.tiers.silver,
    color: Tone.Info,
    multiplier: 150,
  });
  /** Reached at `LoyaltySettings.goldFrom` points; earns double. */
  static readonly Gold = LoyaltyTier.case("gold", {
    label: I18n.loyalty_kit.tiers.gold,
    color: Tone.Warning,
    multiplier: 200,
  });
}
