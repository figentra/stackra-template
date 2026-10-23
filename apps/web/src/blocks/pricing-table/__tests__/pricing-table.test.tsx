/**
 * Stackra file contract:
 * Purpose: the yearly toggle shows the per-month equivalent rounded down, enterprise links to the
 *          contact page with its plan, the trial link carries the plan on the environment's signup
 *          URL, the pricing experiment opens on yearly, and the Arabic rendering uses Latin digits.
 * Boundary: unit tier, jsdom, the @stackra/testing/react providers; flags from
 *           `@stackra/feature-flags/testing`.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0242, ADR 0192 (Latin digits default), ADR 0007
 */
import { fakeFlags } from "@stackra/feature-flags/testing";
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { Flags } from "#stackra/flags";
import { PricingTable } from "#src/blocks/pricing-table/pricing-table";

/** One priced plan and one contact-sales plan. */
const LADDER = {
  trialDays: 14,
  plans: [
    {
      key: "starter",
      name: "Starter",
      prices: { month: 9_900, year: 100_000 },
      currency: "SAR",
      limits: ["2 seats"],
      entitlements: [],
      highlighted: false,
    },
    {
      key: "enterprise",
      name: "Enterprise",
      prices: { month: null, year: null },
      currency: "SAR",
      limits: [],
      entitlements: [],
      highlighted: false,
    },
  ],
};
/** The resolved site of the cases. */
const SITE = { locale: Locale.En, signupUrl: "https://www.acme.example/signup" };

/** Guards the plan ladder, where a wrong price is a commercial error. */
describe(PricingTable, () => {
  /** Yearly prices must show the per-month equivalent rounded down. */
  it("switches to the yearly per-month equivalent, rounded down", async () => {
    render(<PricingTable data={LADDER} product="retail-os" />, { locale: "en", site: SITE });
    expect(screen.getByText("SAR 99.00 per month")).toBeTruthy();
    await userEvent.click(screen.getByRole("radio", { name: /yearly/i }));
    expect(screen.getByText("SAR 83.33 per month")).toBeTruthy(); // 100000 / 12 = 8333.33 → 8333
  });

  /** The trial link must stay on this environment's signup URL and name the plan. */
  it("links the trial to the site's signup URL with the plan", () => {
    render(<PricingTable data={LADDER} product="retail-os" />, { locale: "en", site: SITE });
    const href = screen.getByRole("link", { name: "Start trial" }).getAttribute("href");
    expect(href).toBe(
      "https://www.acme.example/signup?product=retail-os&plan=starter&interval=month",
    );
  });

  /** Enterprise has no price and must route to sales, in the visitor's locale, with its plan. */
  it("sends enterprise to the localised contact page", () => {
    render(<PricingTable data={LADDER} product="retail-os" />, {
      locale: "ar",
      site: { ...SITE, locale: Locale.Ar },
    });
    const link = screen.getByRole("link", { name: "تواصل مع المبيعات" });
    expect(link.getAttribute("href")).toBe("/ar/contact?plan=enterprise");
    expect(screen.getByText(/99\.00/)).toBeTruthy(); // Latin digits by default (ADR 0192)
  });

  /** The experiment arm opens on yearly; the price itself never changes. */
  it("opens on yearly for the experiment arm", () => {
    const flags = fakeFlags((fake) => fake.set(Flags.web.pricing_yearly_first, true));
    render(<PricingTable data={LADDER} product="retail-os" />, { locale: "en", site: SITE, flags });
    expect(screen.getByText("SAR 83.33 per month")).toBeTruthy();
  });
});
