/**
 * Stackra file contract:
 * Purpose: declining keeps analytics off and hides the banner; allowing lets analytics run; both in
 *          Arabic too. The banner only records the decision; the analytics package reacts to it.
 * Boundary: unit tier, jsdom; the analytics driver is the fake of @stackra/analytics/testing,
 *           wired to the in-memory consent store as the real package is.
 * Runtime: browser
 * Governing contract: ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { fakeAnalytics } from "@stackra/analytics/testing";
import { ConsentBanner } from "#src/components/consent-banner";

/** Guards analytics consent, a legal obligation as well as a UX concern. */
describe(ConsentBanner, () => {
  /** Declining must opt out of analytics and dismiss the banner, never track by default. */
  it("declining opts out and hides the banner", async () => {
    const analytics = fakeAnalytics();
    render(<ConsentBanner />, { locale: "en", analytics });
    await userEvent.click(screen.getByRole("button", { name: "Only necessary" }));
    expect(analytics.state).toBe("opted_out");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  /** Accepting must opt in and work in Arabic as well as English. */
  it("allowing opts in, in Arabic", async () => {
    const analytics = fakeAnalytics();
    render(<ConsentBanner />, { locale: "ar", analytics });
    await userEvent.click(screen.getByRole("button", { name: "السماح بالتحليلات" }));
    expect(analytics.state).toBe("opted_in");
  });
});
