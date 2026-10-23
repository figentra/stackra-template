/**
 * Stackra file contract:
 * Purpose: `useSite` returns the site the layout resolved and throws the typed refusal outside the
 *          layout.
 * Boundary: unit tier, jsdom; the render option `site` stands in for the site layout's loader data.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0232, ADR 0007
 */
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { renderHook } from "@stackra/testing/react";
import { SiteContextMissingError } from "#src/errors/site-context-missing.error";
import { useSite } from "#src/hooks/use-site";

/** A resolved site as the layout would provide it. */
const SITE = {
  siteId: "site_1",
  name: "Acme",
  locale: Locale.En,
  dir: "ltr",
  market: { key: "sa", currency: "SAR" },
  indexable: true,
  origin: "https://www.acme.example",
  signupUrl: "https://www.acme.example/signup",
  brand: {},
} as const;

/** Guards the site hook that every localised component depends on. */
describe(useSite, () => {
  /**
   * Components must read the resolved site, not a default, or branding and locale would be wrong.
   */
  it("returns the site the layout resolved", () => {
    const { result } = renderHook(() => useSite(), { site: SITE });
    expect(result.current.name).toBe("Acme");
  });

  /** Outside the layout the hook must fail loudly rather than render with no site. */
  it("throws outside the site layout", () => {
    expect(() => renderHook(() => useSite())).toThrow(SiteContextMissingError);
  });
});
