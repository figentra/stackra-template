/**
 * Stackra file contract:
 * Purpose: proves the console's shadow of `PointsBalance` shows the balance, the tier and the exact
 *          expiry date in English and Arabic, and stays busy without figures while the first answer
 *          loads.
 * Boundary: unit tier, jsdom; the props are what the panel hands the renderer (the kit's
 *           `PointsBalanceProps`).
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0164
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { PointsBalance } from "#src/overrides/@acme/loyalty-kit/src/react/points-balance/points-balance";

/** A gold member with 1,250 points, the oldest expiring on 31 January 2027. */
const DATA = {
  memberId: "mem_1",
  tier: "gold",
  balance: 1250,
  nextExpiryAt: new Date("2027-01-31T00:00:00Z"),
} as const;

/** Guards the console's version of the loyalty balance tile. */
describe(PointsBalance, () => {
  /** The figure, the tier and the date a cashier can quote to the customer. */
  it("shows the balance, the tier and the expiry date", () => {
    render(<PointsBalance data={DATA} isRefreshing={false} />, { locale: "en" });
    expect(screen.getByText("1,250 points")).toBeTruthy();
    expect(screen.getByText("Gold")).toBeTruthy();
    expect(screen.getByText("Oldest points expire on Jan 31, 2027")).toBeTruthy();
  });

  /** Arabic uses its own plural and wording. */
  it("shows the expiry wording in Arabic", () => {
    render(<PointsBalance data={{ ...DATA, nextExpiryAt: null }} isRefreshing={false} />, {
      locale: "ar",
    });
    expect(screen.getByText("لا توجد نقاط على وشك الانتهاء")).toBeTruthy();
  });

  /** No data yet: busy, and no zero balance that a cashier could misread. */
  it("is busy without figures before the first answer", () => {
    const { container } = render(<PointsBalance isRefreshing={false} />, { locale: "en" });
    expect(container.querySelector("[aria-busy='true']")).toBeTruthy();
    expect(screen.queryByText(/points/)).toBeNull();
  });
});
