/**
 * Stackra file contract:
 * Purpose: each entry renders as a quote with its author, and nothing renders with no entries.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { Testimonials } from "#src/blocks/testimonials/testimonials";

const data = {
  entries: [{ id: "t1", fields: { quote: "Sales doubled.", author: "Sara", role: "Owner" } }],
};

/** Guards the testimonials block fed by the `testimonial` content type. */
describe(Testimonials, () => {
  /** The quote and its author must both reach the page. */
  it("renders the quote and the author", () => {
    render(<Testimonials title="Customers" data={data} limit={3} />, { locale: "en" });
    expect(screen.getByText("Sara")).toBeTruthy();
    expect(screen.getByText(/Sales doubled\./)).toBeTruthy();
  });

  /** An empty list must not leave a bare heading on the page. */
  it("renders nothing for an empty list", () => {
    const { container } = render(
      <Testimonials title="Customers" data={{ entries: [] }} limit={3} />,
      {
        locale: "en",
      },
    );
    expect(container.querySelector("section")).toBeNull();
  });
});
