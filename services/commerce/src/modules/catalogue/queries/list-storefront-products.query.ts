/**
 * Stackra file contract:
 * Purpose: `catalogue.product.list_storefront`, PUBLIC area: the storefront grid: Active products
 *          as cards, searched by phrase through the product search index or narrowed to one
 *          collection, cursor-paged.
 * Boundary: read only. Its own key, distinct from the app area's `@Crud` `catalogue.product.list`
 *           (keys are unique per member, ADR 0231); public paths start with `/public`. The console
 *           pages every status with `ProductView`; the public site sees only what is sellable,
 *           priced for its market.
 * Runtime: node
 * Governing contract: ADR 0098, 0082, 0221, http conventions (cursor pagination),
 *                     guides/programming-model.mdx#queries, ADR 0231
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ActorKind, ApiArea, HttpMethod } from "@stackra/contracts";
import { Search } from "@stackra/search";
import { ProductService } from "#modules/catalogue/services/product.service";
import { StorefrontService } from "#modules/catalogue/services/storefront.service";
import { ProductPermissions } from "#modules/catalogue/permissions/product.permission";
import { ProductSearch } from "#modules/catalogue/search/product.search";
import { StorefrontListFilter } from "#modules/catalogue/schemas/storefront-list-filter.schema";
import { StorefrontProductPage } from "#modules/catalogue/schemas/storefront-product-page.schema";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";

/** One page read (index or table) plus one quote per product on the page; `limit` caps at 100. */
@Query({
  key: "product.list_storefront",
  area: ApiArea.Public,
  input: StorefrontListFilter,
  output: StorefrontProductPage,
  permission: ProductPermissions.read,
  actors: [ActorKind.Anonymous, ActorKind.User, ActorKind.Agent, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/public/products" })
export class ListStorefrontProductsQuery {
  /** @param search - the @stackra/search reader; `in(ProductSearch)` queries the declared index. */
  constructor(
    private readonly products: ProductService,
    private readonly storefront: StorefrontService,
    private readonly search: Search,
  ) {}

  /** A phrase goes to the index, ranked; without one the table is paged newest first. */
  async handle(input: StorefrontListFilter, ctx: QueryContext): Promise<StorefrontProductPage> {
    const filters = {
      status: ProductStatus.Active,
      ...(input.collection ? { "collections.slug": input.collection } : {}),
    };
    const page = input.search
      ? await this.search.in(ProductSearch).page(input.search, {
          filters,
          cursor: input.cursor,
          limit: input.limit,
          populate: ["variants"],
        })
      : await this.products.page(
          {
            status: ProductStatus.Active,
            ...(input.collection
              ? { collections: { $contains: [{ slug: input.collection }] } }
              : {}),
          },
          { cursor: input.cursor, limit: input.limit, populate: ["variants"] },
        );
    const at = { locale: ctx.locale, market: ctx.market };
    const items = await Promise.all(page.items.map((p) => this.storefront.toCard(p, at)));
    return { ...page, items };
  }
}
