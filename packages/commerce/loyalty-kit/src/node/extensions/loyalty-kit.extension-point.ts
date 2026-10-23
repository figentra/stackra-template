/**
 * Stackra file contract:
 * Purpose: the kit's extension point: the seams where another module may change how many points a
 *          purchase earns, or refuse a redemption before anything is debited.
 * Boundary: an extension point is the seam this module owns and publishes, part of its contract
 *           like an event; an extension is one class in any module that plugs into one slot of it
 *           (`extends Extension<LoyaltyKitExtensionPoint["earnAdjust"]>` with one `handle`). Each
 *           property is one slot, with Magento's words: `after` runs once the kit computed a value
 *           and each extension returns the value adjusted, in ascending `order`; `before` runs
 *           before the kit's step and an extension may refuse by throwing a Refusal or return
 *           replacement arguments of the same type. Magento's `around` is not a slot: wrapping a
 *           whole action call is an `Interceptor`. AccountService and RedeemPointsWorkflow inject
 *           this class and call each slot as a method, so every call site is greppable, and gen
 *           prints each chain in the manifest. Slot keys are `loyalty_kit.earnAdjust` and
 *           `loyalty_kit.redeemVerify`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 23), ADR 0265 (as amended by programming
 *                     model v3.1, AGENTS.md: `before` and `after` slots)
 */
import { ExtensionPoint } from "@stackra/actions";
import type { EarnDraft } from "#contracts/types/earn-draft.type";
import type { RedeemPointsInput } from "#node/schemas/redeem-points-input.schema";

/** Part of the kit's contract: a renamed slot needs `@Renamed`, like any identity. */
export class LoyaltyKitExtensionPoint extends ExtensionPoint {
  /** After the base earn is computed; each extension returns the points it adjusted. */
  readonly earnAdjust = ExtensionPoint.after<number, [draft: EarnDraft]>();

  /**
   * Before the redeem workflow quotes and debits; an extension refuses by throwing a Refusal, or
   * returns the input it wants the workflow to use instead.
   */
  readonly redeemVerify = ExtensionPoint.before<[input: RedeemPointsInput]>();
}
