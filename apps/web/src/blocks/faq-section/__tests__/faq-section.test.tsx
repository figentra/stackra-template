/**
 * Stackra file contract:
 * Purpose: each question is a named button, the answer is hidden until pressed, and nothing renders
 *          with no entries.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022, WCAG 2.2 AA (accordion semantics)
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { FaqSection } from "#src/blocks/faq-section";

const data = {
  entries: [{ id: "f1", fields: { question: "Is there a trial?", answer: "Yes, 14 days." } }],
};

/** Guards the FAQ accordion that visitors and crawlers rely on. */
describe(FaqSection, () => {
  /**
   * Questions must be real buttons with aria-expanded so keyboard and screen-reader users can open
   * them.
   */
  it("exposes questions as buttons that reveal the answer", async () => {
    render(<FaqSection title="FAQ" data={data} />, { locale: "en" });
    const trigger = screen.getByRole("button", { name: "Is there a trial?" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Yes, 14 days.")).toBeTruthy();
  });

  /** An empty list must not leave a bare heading or empty section on the page. */
  it("renders nothing for an empty list", () => {
    const { container } = render(<FaqSection title="FAQ" data={{ entries: [] }} />, {
      locale: "ar",
    });
    expect(container.querySelector("section")).toBeNull();
  });
});
