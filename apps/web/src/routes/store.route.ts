/**
 * Stackra file contract:
 * Purpose: `/store`: the product listing: full-text search through the commerce search index,
 *          cursor pagination ("show more" keeps the URL shareable), priced in the site's market.
 *          Server-rendered, cached briefly.
 * Boundary: list only; the grid and card are components; the detail page is product.route.ts. `?q=`
 *           asks the search query, otherwise the storefront listing; a search result page is
 *           `noindex` (seo.config `noindexParams`).
 * Runtime: isomorphic
 * Governing contract: ADR 0221 (search behind the query), ADR 0183, HTTP conventions (cursor
 *                     pagination)
 */
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { seoMeta } from "@stackra/seo";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { StorePage } from "#src/components/pages/store";
import { SeoConfig } from "#src/config/seo.config";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { alternates } from "#src/server/alternates.server";
import { SiteLayout } from "#src/routes/site.layout";

/** Cards per page of the listing. */
const PAGE_SIZE = 24;
/** The search query's own lower bound on `q`; shorter text lists instead. */
const MIN_SEARCH_LENGTH = 2;

/** Route `/store`: the product listing with search and cursor pagination. */
@Route({ path: "/store", layout: SiteLayout, cache: CacheProfile.Catalogue, component: StorePage })
export class StoreRoute {
  /** `?q=` searches the index, `?collection=` filters, `?cursor=` continues. */
  async loader(ctx: RouteContext) {
    const q = ctx.search.q?.trim() ?? "";
    const input = {
      collection: ctx.search.collection,
      cursor: ctx.search.cursor,
      limit: PAGE_SIZE,
    };
    const page =
      q.length >= MIN_SEARCH_LENGTH
        ? await ctx.query(Commerce.queries.SearchProducts, { ...input, q })
        : await ctx.query(Commerce.queries.ListStorefrontProducts, input);
    const noindex = ctx.config(SeoConfig).noindexParams.some((p) => p in ctx.search);
    return { page, search: q || undefined, noindex };
  }

  /** Title and description of the store; a search result page is never indexed. */
  meta(ctx: MetaContext<StoreRoute>) {
    const { data, site, t, path } = ctx;
    const url = alternates(ctx, path);
    return seoMeta({
      title: t(I18n.web.store.title),
      description: t(I18n.web.hero.subtitle),
      siteName: site.name,
      locale: site.locale,
      canonical: url[site.locale.value]!,
      alternates: url,
      noindex: !site.indexable || data.noindex,
    });
  }
}
