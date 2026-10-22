/**
 * Stackra file contract:
 * Purpose: proves the pricing page shows the ladder's trial length in the heading's subtitle, with
 *          the Arabic plural form, and renders the FAQ it was given.
 * Boundary: unit tier, jsdom; the page renders with route props as the adapter passes them.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0242
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { PricingPage } from "#src/components/pages/pricing";

/** A two-week trial and one FAQ entry. */
const DATA = {
  ladder: { trialDays: 14, plans: [] },
  faq: [{ id: "f1", fields: { question: "هل توجد تجربة؟", answer: "نعم." } }],
};

/** Guards the page that states the commercial terms. */
describe(PricingPage, () => {
  /** "14 days" in Arabic takes the `many` plural form; a wrong form misstates the offer. */
  it("states the trial length with the Arabic plural", () => {
    render(<PricingPage data={DATA} />, { locale: "ar", route: "/ar/pricing" });
    expect(screen.getByRole("heading", { level: 1, name: "أسعار واضحة بلا مفاجآت" })).toBeTruthy();
    expect(screen.getByText(/14 يومًا/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "هل توجد تجربة؟" })).toBeTruthy();
  });
});
