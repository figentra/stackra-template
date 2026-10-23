/**
 * Stackra file contract:
 * Purpose: the member tiers, lowest first, each with the earn multiplier the tier-multiplier
 *          extension applies.
 * Boundary: an `Enum.of` value plus the type of the same name, in the leaf entry. The code is the
 *           wire and column value; the tone colours the badge and `multiplier` (hundredths) is
 *           what the extension needs. Labels are the derived i18n keys
 *           `loyalty_kit::enums.loyalty_tier.<code>`. Code compares against `LoyaltyTier.Gold`,
 *           never a bare string.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum, Tone } from "@stackra/contracts";

/**
 * One case per tier, in rank order; cases are plain codes, so they compare with `===`.
 *
 * @example
 * Enum.meta(LoyaltyTier, LoyaltyTier.Gold).multiplier; // 200
 * Enum.values(LoyaltyTier);                            // ["bronze", "silver", "gold"]
 */
export const LoyaltyTier = Enum.of({
  Bronze: ["bronze", { tone: Tone.Default, multiplier: 100 }],
  Silver: ["silver", { tone: Tone.Accent, multiplier: 150 }],
  Gold: ["gold", { tone: Tone.Warning, multiplier: 200 }],
});

/** One of the codes above. */
export type LoyaltyTier = Enum.Value<typeof LoyaltyTier>;
