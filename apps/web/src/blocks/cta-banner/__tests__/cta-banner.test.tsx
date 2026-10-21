/**
 * Stackra file contract:
 * Purpose: the banner's button links to its route key in the visitor's locale.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { CtaBanner } from "#src/blocks/cta-banner";

/** Guards the closing call to action a tenant places at the end of a page. */
describe(CtaBanner, () => {
  /** The button names a route key, so the link must resolve to that route's path. */
  it("links the button to its route", () => {
    render(
      <CtaBanner
        title="Ready?"
        body="Open your store today."
        button={{ label: "Contact us", route: "contact" }}
      />,
      { locale: "en" },
    );
    expect(screen.getByRole("heading", { name: "Ready?" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Contact us" }).getAttribute("href")).toBe("/contact");
  });
});
