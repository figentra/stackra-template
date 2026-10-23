/**
 * Stackra file contract:
 * Purpose: the frame of every page: resolves the site once per request (host → tenant site, locale
 *          from the route's mount); its component, `site.tsx` beside it, draws the skip link,
 *          header, footer and consent banner around the outlet.
 * Boundary: the loader is behaviour and runs before any child loader; its value reaches loaders as
 *           `ctx.site`, components through `useSite`, and the generated SEO route modules through
 *           `ctx.layout(SiteLayout)`, each from the router's one run per request. The site record
 *           comes from the experience service's `sites` module through a cached query: the
 *           `page` profile keys it by the host (or the fixed site), the locale and the version, so
 *           no visitor ever sees another site. It imports no server-only module. No session check:
 *           the public site has none. Pages own their meta; an error bubbles to
 *           `src/app.error.tsx`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 17), ADR 0175 (sites by host), ADR 0297
 *                     (decision 3: cache data, not HTML), ADR 0080 (lang and dir)
 */
import type { I18nConfig } from "@stackra/i18n";
import { data, Layout, type RouteContext } from "@stackra/navigation";
import { Experience } from "#stackra/clients";
import type { SiteConfig } from "#src/config/site.config";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import type { ResolvedSite } from "#src/types/resolved-site.type";

/** Frame of every public page: resolves the tenant site and locale once per request. */
export class SiteLayout extends Layout {
  /**
   * @param site - the site config: preview hosts, the fixed site and the signup path.
   * @param i18n - the site's locales, for the direction of the request's mount.
   */
  constructor(
    private readonly site: SiteConfig,
    private readonly i18n: I18nConfig,
  ) {
    super();
  }

  /**
   * The one upstream call every page shares.
   * @throws a 404 response when no site owns the host; the Worker logs it like any other unknown
   *   path.
   */
  override async loader(ctx: RouteContext<this>): Promise<{ site: ResolvedSite }> {
    const host = new URL(ctx.request.url).host;
    const record = this.site.fixedSiteId
      ? await ctx.query(
          Experience.queries.GetSite,
          { siteId: this.site.fixedSiteId },
          { cache: CacheProfile.Page },
        )
      : await ctx.query(Experience.queries.ResolveSite, { host }, { cache: CacheProfile.Page });
    if (!record) throw data({ code: "site_not_found" }, { status: 404 });
    const isPreview = this.site.previewHostPrefixes.some((prefix) => host.startsWith(prefix));
    return {
      site: {
        siteId: record.id,
        name: record.name,
        locale: ctx.locale,
        dir: this.i18n.rtl.includes(ctx.locale) ? "rtl" : "ltr",
        market: record.market,
        indexable: record.indexable && !isPreview,
        origin: ctx.env.siteUrl,
        signupUrl: new URL(this.site.signupPath, ctx.env.siteUrl).href,
        brand: record.brand,
      },
    };
  }
}
