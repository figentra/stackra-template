/**
 * Stackra file contract:
 * Purpose: one fact: how the site is found. The title template (the first link of every page's SEO
 *          default chain), robots groups per crawler, which sitemap sources are written and how
 *          many URLs a sitemap file holds, OG image kinds, and which search parameters make a page
 *          `noindex`.
 * Boundary: values only. Gen writes
 *           `.stackra/route-modules/{robots,sitemap-index,sitemap,og-image}.ts` and
 *           `gen/sitemap.ts` from this class, the `prerender: true` routes and the consumed
 *           manifests' sitemap sources; each page's head is the route module's chain over the
 *           route's `title` and `meta`. The site URL is env.
 * Runtime: isomorphic
 * Governing contract: ADR 0114 (pages are documents)
 */
import { Config } from "@stackra/config";
import { OgKind } from "@stackra/seo";
import { Bool, Int, List, Map, Nested, OneOf, Str } from "@stackra/validation";

/** One `robots.txt` group: the paths one crawler may and may not fetch. */
class RobotsGroup {
  /** `Allow` lines. @defaultValue ["/"] */
  @List(Str) allow: string[] = ["/"];
  /** `Disallow` lines; `*` and `$` as robots.txt defines them. @defaultValue [] */
  @List(Str) disallow: string[] = [];
}

/** Open Graph images rendered on the Worker. */
class OgConfig {
  /** Kinds the `/og/<kind>/<id>` route answers. @defaultValue OgKind.values() */
  @List(OneOf(OgKind)) kinds = OgKind.values();
  /** Image width. @defaultValue 1200 */
  @Int({ min: 1 }) width = 1200;
  /** Image height. @defaultValue 630 */
  @Int({ min: 1 }) height = 630;
  /** Edge cache lifetime of an image. @defaultValue 86400 */
  @Int({ min: 0 }) cacheSeconds = 86_400;
}

/** How the site is found: title template, robots rules, sitemap sources and OG image kinds. */
@Config("web.seo")
export class SeoConfig {
  /** `%s` is the page title. @defaultValue "%s · {siteName}" */
  @Str({ pattern: /%s/ }) titleTemplate = "%s · {siteName}";
  /**
   * `robots.txt` groups by user agent; `*` is every crawler, and another key (for example a
   * crawler you want to keep off the store) adds its own group. A preview host or a sandbox
   * tenant ignores this and disallows everything.
   */
  @Map(Nested(RobotsGroup)) robots: Record<string, RobotsGroup> = {
    "*": { allow: ["/"], disallow: ["/store?q=", "/*?preview="] },
  };
  /**
   * URLs per sitemap file; a source with more is split into numbered files the index lists. The
   * protocol's ceiling is 50,000; a smaller page keeps each Worker request short.
   * @defaultValue 5000
   */
  @Int({ min: 1, max: 50_000 }) sitemapPageSize = 5_000;
  /** Search parameters that turn a page into `noindex`. @defaultValue ["q"] */
  @List(Str) noindexParams: string[] = ["q"];
  /**
   * Write the consumed manifests' sitemap sources besides the prerendered routes.
   * @defaultValue true
   */
  @Bool() consumedSitemaps = true;
  /** The OG image route. */
  @Nested(OgConfig) og = new OgConfig();
  /** Emit hreflang alternates in every head. @defaultValue true */
  @Bool() hreflang = true;
  /** Emit JSON-LD in every head that has structured data. @defaultValue true */
  @Bool() jsonLd = true;
}
