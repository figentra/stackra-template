/**
 * Stackra file contract:
 * Purpose: `catalogue.product.search`, PUBLIC area: storefront full-text search over Active
 *          products through the product search index, ranked, as storefront cards, cursor-paged.
 * Boundary: read only. Distinct from `catalogue.product.list_storefront` (the unranked grid) and
 *           from `catalogue.variant.search` (the POS lookup, app area). Public paths start with
 *           `/public` (ADR 0231); market and locale come from the request.
 * Runtime: node
 * Governing contract: ADR 0098, 0082, 0221, http conventions (cursor pagination), ADR 0231;
 *                     apps/web `routes/store.route.ts`
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ActorKind, ApiArea, HttpMethod } from "@stackra/contracts";
import { Search } from "@stackra/search";
import { StorefrontService } from "#modules/catalogue/services/storefront.service";
import { ProductPermissions } from "#modules/catalogue/permissions/product.permission";
import { ProductSearch } from "#modules/catalogue/search/product.search";
import { SearchProductsInput } from "#modules/catalogue/schemas/search-products-input.schema";
import { StorefrontProductPage } from "#modules/catalogue/schemas/storefront-product-page.schema";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";

/** One index page plus one quote per product on the page; `limit` caps at 100. */
@Query({
  key: "product.search",
  area: ApiArea.Public,
  input: SearchProductsInput,
  output: StorefrontProductPage,
  permission: ProductPermissions.read,
  actors: [ActorKind.Anonymous, ActorKind.User, ActorKind.Agent, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/public/products/search" })
export class SearchProductsQuery {
  /** @param search - the @stackra/search reader; `in(ProductSearch)` queries the declared index. */
  constructor(
    private readonly storefront: StorefrontService,
    private readonly search: Search,
  ) {}

  /** Ranks Active products for the phrase, optionally inside one collection, then prices the cards. */
  async handle(input: SearchProductsInput, ctx: QueryContext): Promise<StorefrontProductPage> {
    const page = await this.search.in(ProductSearch).page(input.q, {
      filters: {
        status: ProductStatus.Active,
        ...(input.collection ? { "collections.slug": input.collection } : {}),
      },
      cursor: input.cursor,
      limit: input.limit,
      populate: ["variants"],
    });
    const at = { locale: ctx.locale, market: ctx.market };
    const items = await Promise.all(page.items.map((p) => this.storefront.toCard(p, at)));
    return { ...page, items };
  }
}
