/**
 * Stackra file contract:
 * Purpose: the kit's own extension of the `loyalty_kit.earnAdjust` slot: silver and gold earn more.
 * Boundary: one class per slot: the slot is the indexed type argument
 *           (`LoyaltyKitExtensionPoint["earnAdjust"]`), and `handle` receives the slot's value
 *           first, then its arguments, then the context, so a changed slot signature is a type
 *           error here. An `after` slot at order 100, so a host's promotions (200 and up) multiply
 *           the tier-adjusted number. No writes, no network (ADR 0265 decision 6).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 16), ADR 0265 decision 3 (as amended by
 *                     programming model v3.1, AGENTS.md)
 */
import { Extension, type ExtensionContext } from "@stackra/actions";
import { Enum } from "@stackra/validation";
import { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";
import type { EarnDraft } from "#contracts/types/earn-draft.type";
import type { LoyaltyKitExtensionPoint } from "#node/extensions/loyalty-kit.extension-point";

/** Multiplies the base points by the tier's multiplier (hundredths), flooring the result. */
export class TierMultiplierExtension extends Extension<LoyaltyKitExtensionPoint["earnAdjust"]>({
  order: 100,
}) {
  /**
   * Scales the base points by the member's tier multiplier.
   * @returns `points` unchanged for bronze (×1.0), so the chain's first link is a no-op for most
   *          members.
   */
  async handle(points: number, draft: EarnDraft, _ctx: ExtensionContext): Promise<number> {
    const { multiplier } = Enum.meta(LoyaltyTier, draft.tier);
    return multiplier === 100 ? points : Math.floor((points * multiplier) / 100);
  }
}
