/**
 * Stackra file contract:
 * Purpose: proves the tile shows the points earned and redeemed today from the query's own output
 *          shape.
 * Boundary: react tier (jsdom); `render` from @stackra/testing/react wraps the i18n and tenant
 *           providers.
 * Runtime: browser
 * Governing contract: ADR 0128 decision 2, ADR 0022, ADR 0007 (amended: test docblocks)
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { PointsIssued } from "#react/points-issued/points-issued";

/**
 * Guards the tile against the data shape it is bound to, since the widget feeds it
 * `PointsIssuedView`.
 */
describe(PointsIssued, () => {
  /**
   * The tile reads `earned` and `redeemed`, not a balance, which is the bug the dedicated point
   * removes.
   */
  it("renders earned and redeemed from the points-issued view", () => {
    render(<PointsIssued data={{ earned: 420, redeemed: 60 }} isRefreshing={false} />);
    expect(screen.getByText("420")).toBeVisible();
    expect(screen.getByText("−60")).toBeVisible();
  });
});
