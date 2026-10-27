/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/seo's configuration: how the site is found. The title
 *          template (the app defaults, first link of every page's SEO chain), robots groups per
 *          crawler, how many URLs a sitemap page holds, OG image kinds, and which search parameters
 *          make a page `noindex`.
 * Boundary: an override declares `override` members only and inherits the base's key (`seo`).
 *           Values only. Gen writes
 *           `.stackra/route-modules/{robots,sitemap-index,sitemap,og-image}.ts` and
 *           `gen/sitemap.ts` from this class, the routes and the consumed manifests' sitemap
 *           sources; each page's head is the chain app defaults, route `seo`, route `meta()`, then
 *           the tenant's SEO record. A rule for one crawler never applies to another. Nested
 *           objects are replaced whole, so they restate the base's type. The site URL is env.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: the Base alias),
 *                     ADR 0301 (decisions 2, 3 and 7), ADR 0114
 */
import { OgKind, SeoConfig as BaseSeoConfig } from "@stackra/seo";

/** How the site is found: title template, robots groups, sitemap paging and OG image kinds. */
export class SeoConfig extends BaseSeoConfig {
  /** `%s` is the page title. */
  override titleTemplate = "%s · {siteName}";

  /**
   * `robots.txt` groups by user agent; `*` is every crawler, and another key (for example a
   * crawler you want to keep off the store) adds its own group. A preview host or a sandbox
   * tenant ignores this and disallows everything.
   */
  override robots: BaseSeoConfig["robots"] = {
    "*": {
      allow: ["/"],
      disallow: ["/store?q=", "/*?preview="],
    },
  };

  /**
   * URLs per sitemap page; a source with more is split into numbered pages the index lists. The
   * protocol's ceiling is 50,000; a smaller page keeps each Worker request short.
   */
  override sitemapPageSize = 5_000;

  /** Search parameters that turn a page into `noindex`. */
  override noindexParams = ["q"];

  /** Write the consumed manifests' sitemap sources besides the site's own routes. */
  override consumedSitemaps = true;

  /** The OG image route: the kinds it answers, the size and the edge lifetime of an image. */
  override og: BaseSeoConfig["og"] = {
    kinds: [OgKind.Site, OgKind.Page, OgKind.Product],
    width: 1200,
    height: 630,
    cacheSeconds: 86_400,
  };

  /** Emit hreflang alternates in every head. */
  override hreflang = true;

  /** Emit JSON-LD, through the escaper, in every head that has structured data. */
  override jsonLd = true;
}
