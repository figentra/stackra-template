/**
 * Stackra file contract:
 * Purpose: proves the contact `submit` is the trust boundary: it returns field errors for a bad
 *          submission without calling anything, refuses a failed captcha, and creates the lead with
 *          the locale and consent on a good one, mapping a refusal code to its i18n key.
 * Boundary: unit tier; `runRouteSubmit` calls the class's `submit` with a fake RouteContext (site,
 *           env, form, captcha); the marketing client is faked at the HTTP boundary.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0140 (refusal codes become i18n keys), ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { refusal } from "@stackra/errors/testing";
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { runRouteSubmit } from "@stackra/testing/react";
import { Marketing } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { ContactRoute } from "#src/routes/contact/contact.route";

/** The Arabic site of the cases. */
const SITE = {
  siteId: "site_1",
  name: "Acme",
  locale: Locale.Ar,
  dir: "rtl",
  market: { key: "sa", currency: "SAR" },
  indexable: true,
  origin: "https://www.acme.example",
  signupUrl: "https://www.acme.example/signup",
  brand: {},
} as const;
/** A complete, valid submission. */
const GOOD = {
  name: "Lina",
  email: "lina@northwind.example",
  message: "We need a store for two brands.",
  consent: "true",
  captchaToken: "tok",
};

/** Runs the submit with a faked marketing client and Turnstile answer. */
function submit(fields: Record<string, string>, marketing = fakeClient(Marketing), captcha = true) {
  const env = { turnstileSecret: "test" };
  return runRouteSubmit(ContactRoute, {
    site: SITE,
    form: fields,
    env,
    captcha,
    clients: [marketing],
  });
}

/** Guards the contact submit, where untrusted input becomes a lead. */
describe(ContactRoute, () => {
  /** Invalid input must be answered with field keys and never reach the lead service. */
  it("returns 400 with i18n keys per field and never calls the service", async () => {
    const marketing = fakeClient(Marketing);
    const result = await submit({ ...GOOD, email: "nope" }, marketing);
    expect(result.status).toBe(400);
    expect(result.data.fieldErrors).toEqual({ email: I18n.web.contact.errors.email });
    expect(marketing.called(Marketing.actions.CreateLead)).toHaveLength(0);
  });

  /** The captcha runs before the service so a bot never costs a lead write. */
  it("refuses when Turnstile says no", async () => {
    const result = await submit(GOOD, fakeClient(Marketing), false);
    expect(result.status).toBe(422);
    expect(result.data.formError).toBe(I18n.leads.refusals.captcha_failed);
  });

  /** Leads must carry the site locale, and service refusals must map to a user-facing message. */
  it("creates the lead with the site locale and maps a refusal code", async () => {
    const marketing = fakeClient(Marketing, (fake) =>
      fake.actions.CreateLead.returns({ leadId: "lead_1" }),
    );
    const ok = await submit(GOOD, marketing);
    expect(ok.data.sent).toEqual({ name: "Lina", email: "lina@northwind.example" });
    expect(marketing.called(Marketing.actions.CreateLead)[0]).toMatchObject({
      locale: Locale.Ar,
      consent: true,
      captchaToken: "tok",
    });

    const limited = fakeClient(Marketing, (fake) =>
      fake.actions.CreateLead.throws(refusal(Marketing.refusals.rate_limited)),
    );
    expect((await submit(GOOD, limited)).data.formError).toBe(I18n.leads.refusals.rate_limited);
  });
});
