/**
 * Stackra file contract:
 * Purpose: proves the override renders the revenue formatted for the locale and currency and keeps
 *          the sparkline out of the accessibility tree, in Arabic too.
 * Boundary: unit tier, jsdom; `renderOverride` mounts the class's component with props typed from
 *           the point.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { renderOverride, screen } from "@stackra/testing/react";
import { RevenueSparklineOverride } from "#src/overrides/orders/components/revenue-sparkline.override";

/** Guards the sample override that replaces a required extension point. */
describe(RevenueSparklineOverride, () => {
  /** Revenue must follow the locale format, and a decorative chart must not be announced. */
  it("formats the revenue for the locale and hides the chart from assistive tech", () => {
    const today = { count: 3, revenueMinor: 50_000, currency: "SAR", hourly: Array(24).fill(1) };
    renderOverride(RevenueSparklineOverride, today, { locale: "ar" });
    expect(screen.getByText("٥٠٠٫٠٠ ر.س.")).toBeTruthy(); // 50 000 halalas are 500.00 riyals
    expect(screen.queryByRole("img")).toBeNull();
  });
});
