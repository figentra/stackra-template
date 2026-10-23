/**
 * Stackra file contract:
 * Purpose: everything the frame, the head and the clients need to know about the request's site:
 *          tenant, locale, direction, market, indexability, origin, signup URL and brand.
 * Boundary: a type shared by the site layout that resolves it, the `useSite` hook that reads it and
 *           the generated SEO route modules; the value is the layout loader's, per request.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 8), ADR 0175 (sites by host), ADR 0080 (locales)
 */
import type { BrandTokens } from "@acme/brand/contracts";
import type { Locale } from "@stackra/i18n";
import type { SiteMarket } from "#src/types/site-market.type";

/** The site of one request, as `SiteLayout.loader` resolved it. */
export interface ResolvedSite {
  /** Public id of the site (`site_…`); builder pages and sitemaps are scoped by it. */
  readonly siteId: string;
  /** Display name, used in the title template and the Organization in JSON-LD. */
  readonly name: string;
  /** The locale of the route's mount (`/ar/...` is `ar`; no prefix is the default). */
  readonly locale: Locale;
  /** `rtl` for the locales i18n.config.ts lists as such. */
  readonly dir: "ltr" | "rtl";
  /** The market whose price list and currency the store shows; from the host. */
  readonly market: SiteMarket;
  /** False on preview hosts and sandbox tenants: robots disallows and every page is `noindex`. */
  readonly indexable: boolean;
  /** The canonical origin of the site; absolute URLs are built from it. */
  readonly origin: string;
  /** Where "start trial" goes: the signup path on the canonical origin. */
  readonly signupUrl: string;
  /** Tenant brand tokens layered over the `@acme/brand` defaults when theming.config.ts allows. */
  readonly brand: Partial<BrandTokens>;
}
