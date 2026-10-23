/**
 * Stackra file contract:
 * Purpose: `/store`: the product listing: full-text search through the commerce search index,
 *          cursor pagination ("show more" keeps the URL shareable), priced in the site's market.
 *          Its page is `store.tsx` beside it, bound by name.
 * Boundary: list only; the grid and card are components; the detail page is the product route.
 *           `?q=` asks the search query, otherwise the storefront listing; both name the
 *           `catalogue` cache profile, so prices and stock are cached briefly per site, locale and
 *           market while the HTML stays private (ADR 0297 d3). A search result page is `noindex`
 *           (the SEO config's `noindexParams`, injected by type).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 17), ADR 0297 (decision 3), ADR 0221 (search
 *                     behind the query), HTTP conventions (cursor pagination)
 */
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import type { Seo, SeoConfig } from "@stackra/seo";
import { ListStorefrontProductsQuery, SearchProductsQuery } from "#stackra/clients/commerce";
import { I18n } from "#stackra/i18n";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { SiteLayout } from "#src/routes/site/site.layout";
import { StoreSearch } from "#src/schemas/store-search.schema";

/** Cards per page of the listing. */
const PAGE_SIZE = 24;
/** The search query's own lower bound on `q`; shorter text lists instead. */
const MIN_SEARCH_LENGTH = 2;

/** Route `/store`: the product listing with search and cursor pagination. */
export class StoreRoute extends Route({
  path: "/store",
  layout: SiteLayout,
  search: StoreSearch,
  seo: { title: I18n.web.store.title },
}) {
  /** @param seo - the site's SEO config; its `noindexParams` mark a search page `noindex`. */
  constructor(private readonly seo: SeoConfig) {
    super();
  }

  /** `?q=` searches the index, `?collection=` filters, `?cursor=` continues. */
  override async loader(ctx: RouteContext<this>) {
    const q = ctx.search.q?.trim() ?? "";
    const input = {
      collection: ctx.search.collection,
      cursor: ctx.search.cursor,
      limit: PAGE_SIZE,
    };
    const cache = { cache: CacheProfile.Catalogue };
    const page =
      q.length >= MIN_SEARCH_LENGTH
        ? await ctx.query(SearchProductsQuery, { ...input, q }, cache)
        : await ctx.query(ListStorefrontProductsQuery, input, cache);
    const noindex = this.seo.noindexParams.some((param) => param in ctx.search);
    return { page, search: q || undefined, noindex };
  }

  /** The store's description; a search result page is never indexed. */
  override meta({ data, t }: MetaContext<this>): Seo {
    return { description: t(I18n.web.hero.subtitle), noindex: data.noindex };
  }
}
