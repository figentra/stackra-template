/**
 * Stackra file contract:
 * Purpose: the hero is the page's one h1, and the secondary action renders only when given.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { HeroSection } from "#src/blocks/hero-section/hero-section";

/** Guards the page opener of the landing page and the `web.hero` block. */
describe(HeroSection, () => {
  /** One h1 per page, and an absent secondary action leaves a single link. */
  it("renders the title as h1 and only the given actions", () => {
    render(
      <HeroSection
        title="Sell online"
        subtitle="A store in minutes."
        cta={{ label: "See pricing", route: "pricing" }}
      />,
      { locale: "en" },
    );
    expect(screen.getByRole("heading", { level: 1, name: "Sell online" })).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
