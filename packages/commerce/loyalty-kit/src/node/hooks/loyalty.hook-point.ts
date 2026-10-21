/**
 * Stackra file contract:
 * Purpose: the hook points the kit offers: where a host may change how many points a purchase
 *          earns, and where it may refuse a redemption.
 * Boundary: a hook-point class: each property is one point, typed by `transform` or `verify`; the
 *           owner injects this class and calls the point as a method, so every call site is
 *           greppable. No `around`, no replacement.
 * Runtime: node
 * Governing contract: ADR 0265 (transform and verify)
 */
import { HookPoint, transform, verify } from "@stackra/actions";
import type { EarnDraft } from "#core/interfaces/earn-draft.interface";
import type { RedeemPointsInput } from "#core/schemas/redeem-points-input.schema";

/**
 * Part of the kit's contract (renames follow deprecation). The chain per point, with file paths, is
 * printed in the host's `.stackra/gen/hooks.ts`. The class is `LoyaltyHooks`; the file is
 * `loyalty.hook-point.ts`.
 */
@HookPoint()
export class LoyaltyHooks {
  /**
   * Runs while computing an earn, in implementer `order`; each implementer returns the points with
   * its change applied.
   */
  readonly earnAdjust = transform<number, [draft: EarnDraft]>();
  /**
   * Runs before the redeem workflow debits; an implementer refuses by throwing an AppError with a
   * snake_case code.
   */
  readonly redeemVerify = verify<[input: RedeemPointsInput]>();
}
