/**
 * Stackra file contract:
 * Purpose: `catalogue.variant.search@1`: a SKU, barcode or title typed at the POS when a scan is
 *          not possible.
 * Boundary: read only; active products only. It queries the product's search index (which covers
 *           the title, the SKUs and the barcodes), then returns the matching products' variants in
 *           rank order. The key's aggregate is `variant`, so the permission is named:
 *           `ProductPermissions.read`, L0 (ADR 0132). The path is kept as `GET /variants` instead
 *           of the derived one.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0155, ADR 0221
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { Search } from "@stackra/search";
import { ProductPermissions } from "#modules/catalogue/access/product.permissions";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { Product } from "#modules/catalogue/models/product.model";
import type { SearchVariantsInput } from "#modules/catalogue/schemas/search-variants-input.schema";
import { SearchVariantsOutput } from "#modules/catalogue/schemas/search-variants-output.schema";

/** Ranked by the index, so an exact SKU outranks a word in a title. */
export class SearchVariantsQuery extends Query({
  key: "variant.search",
  permission: ProductPermissions.read,
  actors: [ActorKind.User, ActorKind.Service],
  intent: true,
  endpoint: {
    method: HttpMethod.Get,
    path: "/variants",
  },
}) {
  /**
   * @param search - the @stackra/search reader over the product's index.
   */
  constructor(private readonly search: Search) {
    super();
  }

  /** Flattens the ranked products into variant hits and stops at `limit`. */
  async handle(input: SearchVariantsInput, ctx: QueryContext): Promise<SearchVariantsOutput> {
    const products = await this.search.in(Product).find(input.q, {
      filters: { status: ProductStatus.Active },
      limit: input.limit,
      populate: ["variants"],
    });
    const items = products.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        productId: product.id,
        sku: variant.sku,
        title: product.title.in(ctx.locale),
        trackInventory: variant.trackInventory,
      })),
    );
    return SearchVariantsOutput.create({ items: items.slice(0, input.limit) });
  }
}
