/**
 * Stackra file contract:
 * Purpose: proves the landing page composes its sections from the loader data and points both
 *          calls to action at real routes in the visitor's locale mount.
 * Boundary: unit tier, jsdom; the page renders with route props as the adapter passes them.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { Landing } from "#src/routes/landing/landing";

/** What LandingRoute loads: an empty ladder, no testimonials, one FAQ entry. */
const DATA = {
  ladder: { trialDays: 14, plans: [] },
  testimonials: [],
  faq: [{ id: "f1", fields: { question: "Is there a trial?", answer: "Yes, 14 days." } }],
};

/** Guards the site's front door. */
describe(Landing, () => {
  /** The hero's two actions land on pricing and the store of the visitor's locale. */
  it("links the hero actions to pricing and the store in Arabic", () => {
    render(<Landing data={DATA} />, { locale: "ar", route: "/ar" });
    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links).toContain("/ar/pricing");
    expect(links).toContain("/ar/store");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });
});
