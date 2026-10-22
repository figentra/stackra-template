/**
 * Stackra file contract:
 * Purpose: one fact: how the site is found. Title template, robots rules, which sitemap sources are
 *          written, OG image kinds, and which search parameters make a page `noindex`.
 * Boundary: values only. Gen writes
 *           `.stackra/routes/{robots,sitemap-index,sitemap,og-image}.route.ts` and `gen/sitemap.ts`
 *           from this class, the `prerender: true` routes and the consumed manifests' sitemap
 *           sources; each page's head is its route's `meta` through `seoMeta`. The site URL is env.
 * Runtime: isomorphic
 * Governing contract: ADR 0176, ADR 0114 (pages are documents)
 */
import { Config } from "@stackra/config";
import { OgKind } from "@stackra/seo";
import { Bool, Int, List, Nested, OneOf, Str } from "@stackra/validation";

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
  /** Literal robots `Disallow` patterns. @defaultValue ["/store?q=", "/*?preview="] */
  @List(Str) disallow: string[] = ["/store?q=", "/*?preview="];
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
