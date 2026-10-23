/**
 * Stackra file contract:
 * Purpose: proves the balance renderer warns when points expire within thirty days, and renders
 *          right-to-left for Arabic.
 * Boundary: react tier (jsdom); `render` from @stackra/testing/react wraps the i18n (en, ar RTL)
 *           and tenant providers.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 7), ADR 0022
 */
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";
import { PointsBalance } from "#react/points-balance/points-balance";

/**
 * The expiry warning and the RTL path; the balance number itself is the UI kit's Stat and not
 * asserted.
 */
describe(PointsBalance, () => {
  /**
   * Eleven days before expiry is inside the thirty-day window; the Arabic string proves the lang
   * file and `dir` both load.
   */
  it("warns about an expiry within thirty days, in Arabic too", () => {
    freezeClock("2026-10-21T00:00:00Z");
    render(
      <PointsBalance
        data={{
          memberId: "usr_1",
          tier: LoyaltyTier.Gold,
          balance: 1_000,
          nextExpiryAt: new Date("2026-11-01T00:00:00Z"),
        }}
        isRefreshing={false}
      />,
      { locale: "ar" },
    );
    expect(screen.getByText("ستنتهي صلاحية بعض نقاطك قريباً.")).toBeVisible();
    expect(document.dir).toBe("rtl");
  });
});
