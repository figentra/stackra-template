/**
 * Stackra file contract:
 * Purpose: proves the contact page records `LeadSubmitted` once, with the plan and nothing
 *          personal, only when the submit answered `sent`, and records nothing for a refused
 *          submission.
 * Boundary: unit tier, jsdom; the page renders with route props as the adapter passes them;
 *           analytics is the fake of `@stackra/analytics/testing`.
 * Runtime: browser
 * Governing contract: ADR 0022
 */
import { fakeAnalytics } from "@stackra/analytics/testing";
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { I18n } from "#stackra/i18n";
import { LeadSubmitted } from "#src/analytics/lead-submitted.event";
import { ContactPage } from "#src/components/pages/contact";

/** Guards the one place a lead becomes an analytics event. */
describe(ContactPage, () => {
  /** The server accepted the lead, so the event is recorded once, re-renders included. */
  it("records LeadSubmitted once after the server accepted the lead", () => {
    const analytics = fakeAnalytics();
    const props = {
      submitted: { sent: { name: "Lina", email: "lina@acme.example" } },
      search: { plan: "enterprise" },
    };
    const { rerender } = render(<ContactPage {...props} />, { locale: "en", analytics });
    rerender(<ContactPage {...props} />);
    expect(screen.getByRole("status")).toHaveTextContent("Lina");
    expect(analytics.events()).toEqual([new LeadSubmitted({ plan: "enterprise" })]);
  });

  /** A refusal is not a lead: nothing is recorded and the form stays with its error. */
  it("records nothing when the submit refused", () => {
    const analytics = fakeAnalytics();
    render(
      <ContactPage
        submitted={{ formError: I18n.leads.refusals.captcha_failed }}
        search={{ plan: "enterprise" }}
      />,
      { locale: "en", analytics, route: "/contact" },
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(analytics.events()).toEqual([]);
  });
});
