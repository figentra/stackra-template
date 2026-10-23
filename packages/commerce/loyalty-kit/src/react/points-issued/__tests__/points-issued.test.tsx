/**
 * Stackra file contract:
 * Purpose: proves the renderer shows the points earned and redeemed today from the query's own
 *          output shape.
 * Boundary: react tier (jsdom); `render` from @stackra/testing/react wraps the i18n and tenant
 *           providers.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 7), ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { PointsIssued } from "#react/points-issued/points-issued";

/**
 * Guards the renderer against the data shape it is bound to, since the widget feeds it
 * `PointsIssuedView`.
 */
describe(PointsIssued, () => {
  /**
   * The renderer reads `earned` and `redeemed`, not a balance: it is bound to the points-issued
   * query, not the balance one.
   */
  it("renders earned and redeemed from the points-issued view", () => {
    render(<PointsIssued data={{ earned: 420, redeemed: 60 }} isRefreshing={false} />);
    expect(screen.getByText("420")).toBeVisible();
    expect(screen.getByText("−60")).toBeVisible();
  });
});
