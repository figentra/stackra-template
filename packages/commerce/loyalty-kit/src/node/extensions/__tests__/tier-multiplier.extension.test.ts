/**
 * Stackra file contract:
 * Purpose: proves gold doubles and bronze is untouched, through the `handle` of the earnAdjust
 *          extension.
 * Boundary: unit tier; the extension has no dependencies, so it is constructed directly; the
 *           context comes from @stackra/actions/testing.
 * Runtime: node
 * Governing contract: ADR 0265, ADR 0294 (decision 16), ADR 0022
 */
import { memberId } from "@acme/loyalty-kit";
import { LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { fakeExtensionContext } from "@stackra/actions/testing";
import { describe, expect, it } from "@stackra/testing";
import { TierMultiplierExtension } from "#node/extensions/tier-multiplier.extension";

/** An earn of 100.00 in a currency the extension does not need to know. */
const draft = { memberId: memberId("usr_1"), amountMinor: 10_000, currency: "SAR" };

/** Guards the earn-rate extension so tier benefits are applied exactly as configured. */
describe(TierMultiplierExtension, () => {
  /** The multiplier comes from the enum's meta, so this also proves the cases carry it. */
  it("doubles for gold and leaves bronze at the base rate", async () => {
    const extension = new TierMultiplierExtension();
    const ctx = fakeExtensionContext();

    expect(await extension.handle(100, { ...draft, tier: LoyaltyTier.Bronze }, ctx)).toBe(100);
    expect(await extension.handle(100, { ...draft, tier: LoyaltyTier.Gold }, ctx)).toBe(200);
  });
});
