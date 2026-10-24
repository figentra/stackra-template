/**
 * Stackra file contract:
 * Purpose: `catalogue.product.list_storefront@1`, public area: the storefront grid: active products
 *          as cards, searched by phrase through the product's search index or narrowed to one
 *          collection, cursor-paged.
 * Boundary: read only. Its own key, distinct from the admin area's generated
 *           `catalogue.product.list@1` (keys are unique per member, ADR 0231). The console pages
 *           every status as ProductView; the public site sees only what is sellable, priced for its
 *           market. The permission is derived (`ProductPermissions.read`); the path is kept as
 *           `/public/products` instead of the derived one.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0082 (public area), ADR 0221
 *                     (hybrid search), cursor pagination in the HTTP conventions
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, ApiArea, HttpMethod } from "@stackra/contracts";
import type { Search } from "@stackra/search";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { Product } from "#modules/catalogue/models/product.model";
import type { ListStorefrontProductsInput } from "#modules/catalogue/schemas/list-storefront-products-input.schema";
import { StorefrontProductPage } from "#modules/catalogue/schemas/storefront-product-page.schema";
import type { ProductService } from "#modules/catalogue/services/product.service";
import type { StorefrontService } from "#modules/catalogue/services/storefront.service";

/** One page read (index or table) plus one quote per product on the page. */
export class ListStorefrontProductsQuery extends Query({
  key: "product.list_storefront",
  area: ApiArea.Public,
  actors: [ActorKind.Anonymous, ActorKind.User, ActorKind.Agent, ActorKind.Service],
  endpoint: {
    method: HttpMethod.Get,
    path: "/public/products",
  },
}) {
  /**
   * @param search - the @stackra/search reader; `in(Product)` queries the model's index.
   */
  constructor(
    private readonly products: ProductService,
    private readonly storefront: StorefrontService,
    private readonly search: Search,
  ) {
    super();
  }

  /** A phrase goes to the index, ranked; without one the table is paged newest first. */
  async handle(
    input: ListStorefrontProductsInput,
    ctx: QueryContext,
  ): Promise<StorefrontProductPage> {
    const page = input.search
      ? await this.search.in(Product).page(input.search, {
          filters: {
            status: ProductStatus.Active,
            ...(input.collection ? { "collections.slug": input.collection } : {}),
          },
          cursor: input.cursor,
          limit: input.limit,
          populate: ["variants", "collections"],
        })
      : await this.products.page(
          {
            status: ProductStatus.Active,
            ...(input.collection ? { collections: { slug: input.collection } } : {}),
          },
          { cursor: input.cursor, limit: input.limit, populate: ["variants", "collections"] },
        );
    const items = await Promise.all(
      page.items.map((product) => this.storefront.toCard(product, ctx)),
    );
    return StorefrontProductPage.create({ ...page, items });
  }
}
