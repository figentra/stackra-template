/**
 * Stackra file contract:
 * Purpose: proves the native balance renderer shows the balance and tier, warns when points expire
 *          within thirty days, in Arabic too, and stays quiet when the expiry is further away.
 * Boundary: native tier; `render` from @stackra/testing/native wraps the i18n (en, ar) and tenant
 *           providers around the compiled class component. The clock is frozen, so the warning
 *           window is exact.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 7, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0022, ADR 0302 (both platforms implement the contract)
 */
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/native";
import { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";
import { PointsBalance } from "#native/points-balance/points-balance";

/** A gold balance of 420 points whose oldest points expire on the given day. */
function balance(nextExpiryAt: string) {
  return {
    memberId: "usr_1",
    tier: LoyaltyTier.Gold,
    balance: 420,
    nextExpiryAt: new Date(nextExpiryAt),
  };
}

/** The native twin of the web renderer: same props, same warning rule. */
describe("PointsBalance (native)", () => {
  /** Eleven days before expiry is inside the window; the Arabic text proves the lang file loads. */
  it("warns about an expiry within thirty days, in Arabic too", () => {
    freezeClock("2026-10-21T00:00:00Z");
    render(<PointsBalance data={balance("2026-11-01T00:00:00Z")} isRefreshing={false} />, {
      locale: "ar",
    });
    expect(screen.getByText("ستنتهي صلاحية بعض نقاطك قريباً.")).toBeTruthy();
    expect(screen.getByText("ذهبي")).toBeTruthy();
  });

  /** Three months away is outside the window: the balance shows, the warning does not. */
  it("shows the balance without a warning when the expiry is far away", () => {
    freezeClock("2026-10-21T00:00:00Z");
    render(<PointsBalance data={balance("2027-01-21T00:00:00Z")} isRefreshing={false} />, {
      locale: "en",
    });
    expect(screen.getByText("420")).toBeTruthy();
    expect(screen.queryByText("Some of your points expire soon.")).toBeNull();
  });
});
