/**
 * Stackra file contract:
 * Purpose: the real server logic of the site: host → tenant site, once per request. The site
 *          layout's `resolve` calls it; every loader then receives `ctx.site`, and the generated
 *          SEO routes call it with their own context.
 * Boundary: resolution only; config comes from the caller's `ctx.config`, the locale from the
 *           route's mount, the env from `ctx.env`. The site record comes from the experience
 *           service's `sites` module.
 * Runtime: worker
 * Governing contract: ADR 0175 (tenant domains), ADR 0080 (locales), ADR 0231
 */
import type { BrandTokens } from "@stackra/brand";
import type { Locale } from "@stackra/i18n";
import { data, type RouteContext } from "@stackra/navigation";
import { Experience } from "#stackra/clients";
import { I18nConfig } from "#src/config/i18n.config";
import { SiteConfig } from "#src/config/site.config";

/** Everything the layout, the head and the clients need to know about the request's site. */
export interface ResolvedSite {
  /** Public id of the site (`site_…`); builder pages and sitemaps are scoped by it. */
  readonly siteId: string;
  /** Display name, used in the title template and the Organization in JSON-LD. */
  readonly name: string;
  /** The locale of the route's mount (`/ar/...` is `ar`; no prefix is the default). */
  readonly locale: Locale;
  /** `rtl` for the locales `i18n.config.ts` lists as such. */
  readonly dir: "ltr" | "rtl";
  /**
   * The market whose price list and currency the store shows; from the host, not the visitor's
   * location.
   */
  readonly market: { readonly key: string; readonly currency: string };
  /**
   * False on preview hosts and sandbox tenants: robots disallows and every page carries `noindex`.
   */
  readonly indexable: boolean;
  /** The canonical origin of the site; absolute URLs are built from it. */
  readonly origin: string;
  /** Where "start trial" goes: the signup path on the canonical origin. */
  readonly signupUrl: string;
  /**
   * Tenant brand tokens layered over the `@stackra/brand` defaults when `theming.config.ts` allows.
   */
  readonly brand: Partial<BrandTokens>;
}

/**
 * One resolution per request: loaders run in parallel and each asks; the request context is the
 * key.
 */
const perRequest = new WeakMap<object, Promise<ResolvedSite>>();

/**
 * Resolves the request's host to a site, cached for the rest of the request.
 * @throws a 404 `Response` when no site owns the host; the Worker logs it like any other unknown
 * path.
 */
export function resolveSite(ctx: RouteContext): Promise<ResolvedSite> {
  let pending = perRequest.get(ctx.request);
  if (!pending) {
    pending = resolveUncached(ctx);
    perRequest.set(ctx.request, pending);
  }
  return pending;
}

/** The uncached lookup behind {@link resolveSite}. */
async function resolveUncached(ctx: RouteContext): Promise<ResolvedSite> {
  const site = ctx.config(SiteConfig);
  const host = new URL(ctx.request.url).host;
  const record = site.fixedSiteId
    ? await ctx.query(Experience.queries.GetSite, { siteId: site.fixedSiteId })
    : await ctx.query(Experience.queries.ResolveSite, { host });
  if (!record) throw data({ code: "site_not_found" }, { status: 404 });
  const isPreview = site.previewHostPrefixes.some((prefix) => host.startsWith(prefix));
  return {
    siteId: record.id,
    name: record.name,
    locale: ctx.locale,
    dir: ctx.config(I18nConfig).rtl.includes(ctx.locale) ? "rtl" : "ltr",
    market: record.market,
    indexable: record.indexable && !isPreview,
    origin: ctx.env.siteUrl,
    signupUrl: new URL(site.signupPath, ctx.env.siteUrl).href,
    brand: record.brand,
  };
}
