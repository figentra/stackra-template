/**
 * Stackra file contract:
 * Purpose: where a host may change how many points a purchase earns, and where it may refuse a
 *          redemption.
 * Boundary: each property is one point, typed by `transform` (returns the changed value) or
 *           `verify` (refuses by throwing a Refusal); the extra tuple types are the read-only
 *           arguments every implementer also receives. AccountService and RedeemPointsWorkflow
 *           inject this class and call each point as a method, so every call site is greppable. An
 *           implementer is an `Extension(LoyaltyKitExtensionPoint, { order })` class with one
 *           method named after one point. Point keys are `loyalty_kit.earnAdjust` and
 *           `loyalty_kit.redeemVerify`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 23), ADR 0265 (transform and verify)
 */
import { ExtensionPoint } from "@stackra/actions";
import type { EarnDraft } from "#contracts/types/earn-draft.type";
import type { RedeemPointsInput } from "#core/schemas/redeem-points-input.schema";

/** Part of the kit's contract: a renamed point needs `@Renamed`, like any identity. */
export class LoyaltyKitExtensionPoint extends ExtensionPoint {
  /** Runs while computing an earn, in implementer `order`; each returns the points it adjusted. */
  readonly earnAdjust = ExtensionPoint.transform<number, [draft: EarnDraft]>();

  /** Runs before the redeem workflow debits; an implementer refuses by throwing a Refusal. */
  readonly redeemVerify = ExtensionPoint.verify<[input: RedeemPointsInput]>();
}
