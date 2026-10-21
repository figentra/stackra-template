/**
 * Stackra file contract:
 * Purpose: the adapter shows the schema's translated message before any request, a server field
 *          error shows at once (in Arabic too), and a valid submission records `LeadSubmitted` with
 *          the plan and nothing personal.
 * Boundary: unit tier, jsdom; the router stub catches the submit so nothing posts; analytics is the
 *           fake of `@stackra/analytics/testing`.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0165 decision 2
 */
import { fakeAnalytics } from "@stackra/analytics/testing";
import { describe, expect, it, vi } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { createRoutesStub } from "@stackra/navigation/testing";
import { I18n } from "#stackra/i18n";
import { LeadSubmitted } from "#src/analytics/lead-submitted.event";
import { ContactForm } from "#src/components/contact-form";

/**
 * Mounts the form under a router stub whose submit is a spy; returns the spy and the analytics
 * fake.
 */
function mount(locale: "en" | "ar", props: Parameters<typeof ContactForm>[0] = {}) {
  const action = vi.fn(() => null);
  const analytics = fakeAnalytics();
  const Stub = createRoutesStub([
    { path: "/contact", Component: () => <ContactForm {...props} />, action },
  ]);
  render(<Stub initialEntries={["/contact"]} />, { locale, analytics });
  return { action, analytics };
}

/** Guards the contact form UX, the site's main lead capture. */
describe(ContactForm, () => {
  /** Invalid input must be stopped client-side with a readable message, not sent to the server. */
  it("blocks submit with the translated schema message", async () => {
    const { action } = mount("en");
    await userEvent.type(screen.getByLabelText("Work email"), "nope");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("That does not look like an email address.")).toBeTruthy();
    expect(action).not.toHaveBeenCalled();
  });

  /** Server-side refusals must appear on the field at once, in the visitor's language. */
  it("shows a server field error immediately, in Arabic", () => {
    mount("ar", { fieldErrors: { message: I18n.web.contact.errors.message } });
    expect(screen.getByText("يرجى كتابة جملة واحدة على الأقل.")).toBeTruthy();
  });

  /** The event names the plan the visitor came from and never carries their name or email. */
  it("records LeadSubmitted with the plan on a valid submission", async () => {
    const { analytics } = mount("en", { plan: "enterprise" });
    await userEvent.type(screen.getByLabelText("Your name"), "Lina");
    await userEvent.type(screen.getByLabelText("Work email"), "lina@example.com");
    await userEvent.type(
      screen.getByLabelText("How can we help?"),
      "We need a store for two brands.",
    );
    await userEvent.click(screen.getByLabelText("You may contact me about this request."));
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(analytics.events()).toEqual([new LeadSubmitted({ plan: "enterprise" })]);
  });
});
