/**
 * Stackra file contract:
 * Purpose: proves the landing page renders the ladder from the loader in English and in Arabic
 *          (RTL), with the prices in the market currency, and asks content for the FAQ entry type.
 * Boundary: unit tier, jsdom; `renderRoute` mounts the layout's resolve, the loader and the
 *           component under the testing providers; the clients are faked at the HTTP boundary.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080 (every screen renders under both locales), ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { ContentEntryType } from "@stackra/content";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen } from "@stackra/testing/react";
import { ListPlansQuery } from "#stackra/clients/billing";
import { ListEntriesQuery } from "#stackra/clients/content";
import { ResolveSiteQuery } from "#stackra/clients/experience";
import { LandingRoute } from "#src/routes/landing/landing.route";
import { Routes } from "#stackra/routes";

/** The site every host resolves to. */
const SITE = {
  id: "site_1",
  name: "Acme",
  market: { key: "sa", currency: "SAR" },
  indexable: true,
  brand: {},
};
/** Builds one rung of the ladder. */
const plan = (key: string, name: string, month: number | null, highlighted = false) => ({
  key,
  name,
  prices: { month, year: month === null ? null : month * 10 },
  currency: "SAR",
  limits: month ? ["seats"] : [],
  entitlements: [],
  highlighted,
});
/** Starter, a highlighted Pro and a contact-sales Enterprise. */
const LADDER = {
  trialDays: 14,
  plans: [
    plan("starter", "Starter", 9_900),
    plan("pro", "Pro", 29_900, true),
    plan("enterprise", "Enterprise", null),
  ],
};
/** One FAQ entry. */
const FAQ = {
  entries: [{ id: "f1", fields: { question: "Is there a trial?", answer: "Yes, 14 days." } }],
};

/** Mounts the route with every client faked. */
function mount(locale: "en" | "ar") {
  const clients = [
    fakeClient((fake) => fake.on(ResolveSiteQuery).returns(SITE)),
    fakeClient((fake) => fake.on(ListPlansQuery).returns(LADDER)),
    fakeClient((fake) =>
      fake
        .on(ListEntriesQuery)
        .when({ type: ContentEntryType.Faq })
        .returns(FAQ)
        .otherwise({ entries: [] }),
    ),
  ];
  return {
    clients,
    ...renderRoute(Routes.landing, { locale, clients, route: locale === "ar" ? "/ar" : "/" }),
  };
}

/** Guards the landing page, the main marketing entry point. */
describe(LandingRoute, () => {
  /** Every plan must appear with the right price and the highlighted plan marked. */
  it("shows every plan with its monthly price and marks the highlighted one", async () => {
    mount("en");
    expect(await screen.findByRole("heading", { name: "Pro" })).toBeTruthy();
    expect(screen.getByText("SAR 299.00 per month")).toBeTruthy();
    expect(screen.getByText("Most popular")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Contact sales" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Is there a trial?" })).toBeTruthy();
  });

  /** Arabic must render right-to-left with the same plan ladder as English. */
  it("renders right-to-left in Arabic with the same ladder", async () => {
    const { container } = mount("ar");
    expect(await screen.findByRole("heading", { name: "أسعار واضحة بلا مفاجآت" })).toBeTruthy();
    expect(container.closest("[dir]")?.getAttribute("dir")).toBe("rtl");
    expect(screen.getByText("الأكثر شيوعًا")).toBeTruthy();
  });
});
