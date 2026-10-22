/**
 * Stackra file contract:
 * Purpose: `useSite` returns the provided site and throws the typed error outside the provider.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0232, ADR 0007
 */
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { renderHook } from "@stackra/testing/react";
import { SiteContextMissingError } from "#src/errors/site-context-missing.error";
import { SiteContextProvider } from "#src/providers/site/site.context";
import { useSite } from "#src/providers/site/use-site";

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

/** Guards the site context hook that every localised component depends on. */
describe(useSite, () => {
  /**
   * Components must read the resolved site, not a default, or branding and locale would be wrong.
   */
  it("returns the provided site", () => {
    const { result } = renderHook(() => useSite(), {
      wrapper: ({ children }) => <SiteContextProvider value={SITE}>{children}</SiteContextProvider>,
    });
    expect(result.current.name).toBe("Acme");
  });

  /**
   * A missing provider must fail loudly with the typed error rather than render with an undefined
   * site.
   */
  it("throws outside the provider", () => {
    expect(() => renderHook(() => useSite())).toThrow(SiteContextMissingError);
  });
});
