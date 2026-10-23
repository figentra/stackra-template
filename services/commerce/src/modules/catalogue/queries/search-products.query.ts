/**
 * Stackra file contract:
 * Purpose: `catalogue.product.search@1`, public area: storefront full-text search over active
 *          products through the product's search index, ranked, as storefront cards, cursor-paged.
 * Boundary: read only. Distinct from `catalogue.product.list_storefront@1` (the unranked grid) and
 *           from `catalogue.variant.search@1` (the POS lookup, app area). The permission is derived
 *           (`ProductPermissions.read`) and so is the endpoint (`GET /public/products/search`);
 *           market and locale come from the request.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0082 (public area), ADR 0221
 *                     (hybrid search), cursor pagination in the HTTP conventions
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, ApiArea } from "@stackra/contracts";
import type { Search } from "@stackra/search";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { Product } from "#modules/catalogue/models/product.model";
import type { SearchProductsInput } from "#modules/catalogue/schemas/search-products-input.schema";
import { StorefrontProductPage } from "#modules/catalogue/schemas/storefront-product-page.schema";
import type { StorefrontService } from "#modules/catalogue/services/storefront.service";

/** One index page plus one quote per product on the page. */
export class SearchProductsQuery extends Query({
  key: "product.search",
  area: ApiArea.Public,
  actors: [ActorKind.Anonymous, ActorKind.User, ActorKind.Agent, ActorKind.Service],
}) {
  /** @param search - the @stackra/search reader; `in(Product)` queries the model's index. */
  constructor(
    private readonly storefront: StorefrontService,
    private readonly search: Search,
  ) {
    super();
  }

  /** Ranks active products for the phrase, optionally inside one collection, then prices them. */
  async handle(input: SearchProductsInput, ctx: QueryContext): Promise<StorefrontProductPage> {
    const page = await this.search.in(Product).page(input.q, {
      filters: {
        status: ProductStatus.Active,
        ...(input.collection ? { "collections.slug": input.collection } : {}),
      },
      cursor: input.cursor,
      limit: input.limit,
      populate: ["variants"],
    });
    const items = await Promise.all(
      page.items.map((product) => this.storefront.toCard(product, ctx)),
    );
    return StorefrontProductPage.create({ ...page, items });
  }
}
