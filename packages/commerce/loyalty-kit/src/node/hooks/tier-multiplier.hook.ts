/**
 * Stackra file contract:
 * Purpose: the kit's own built-in implementer of `LoyaltyHooks.earnAdjust`: silver and gold earn
 *          more.
 * Boundary: a transform hook at order 100, so a host's promotions (200+) multiply the tier-adjusted
 *           number. No writes, no network (ADR 0265 decision 6). `Implements<LoyaltyHooks,
 *           "earnAdjust">` is a checked key, so a renamed point is a type error here.
 * Runtime: node
 * Governing contract: ADR 0265 decision 3 (implementers in hooks/)
 */
import { Hook, type HookContext, type Implements } from "@stackra/actions";
import type { EarnDraft } from "#core/interfaces/earn-draft.interface";
import { LoyaltyHooks } from "#node/hooks/loyalty.hook-point";

/** Multiplies the base points by the tier's multiplier (hundredths), flooring the result. */
@Hook(LoyaltyHooks, { order: 100 })
export class TierMultiplierHook implements Implements<LoyaltyHooks, "earnAdjust"> {
  /**
   * Scales the base points by the member's tier multiplier.
   * @returns `points` unchanged for bronze (×1.0), so the chain's first link is a no-op for most
   * members.
   */
  async earnAdjust(points: number, draft: EarnDraft, _ctx: HookContext): Promise<number> {
    const { multiplier } = draft.tier.meta;
    return multiplier === 100 ? points : Math.floor((points * multiplier) / 100);
  }
}
