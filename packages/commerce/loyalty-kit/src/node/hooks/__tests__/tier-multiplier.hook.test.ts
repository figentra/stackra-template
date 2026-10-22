/**
 * Stackra file contract:
 * Purpose: proves gold doubles and bronze is untouched.
 * Boundary: unit tier; the hook has no dependencies, so it is constructed directly; context from
 *           @stackra/actions/testing.
 * Runtime: node
 * Governing contract: ADR 0265, ADR 0022, ADR 0007 (amended: test docblocks)
 */
import { describe, expect, it } from "@stackra/testing";
import { fakeHookContext } from "@stackra/actions/testing";
import { LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { memberId } from "@acme/loyalty-kit";
import { TierMultiplierHook } from "#node/hooks/tier-multiplier.hook";

const draft = { memberId: memberId("usr_1"), amountMinor: 10_000, currency: "SAR" };

/** Guards the earn-rate hook so tier benefits are applied exactly as configured. */
describe(TierMultiplierHook, () => {
  /** The multiplier comes from the enum's meta, so this also proves the cases carry it. */
  it("doubles for gold and leaves bronze at the base rate", async () => {
    const hook = new TierMultiplierHook();
    expect(
      await hook.earnAdjust(100, { ...draft, tier: LoyaltyTier.Bronze }, fakeHookContext()),
    ).toBe(100);
    expect(
      await hook.earnAdjust(100, { ...draft, tier: LoyaltyTier.Gold }, fakeHookContext()),
    ).toBe(200);
  });
});
