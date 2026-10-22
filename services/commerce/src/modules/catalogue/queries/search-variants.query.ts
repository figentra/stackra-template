/**
 * Stackra file contract:
 * Purpose: `catalogue.variant.search`: SKU, barcode or title typed at the POS when a scan is not
 *          possible.
 * Boundary: read only; Active products only. It queries the product search index (ProductSearch
 *           covers title, SKUs and barcodes), then returns the matching products' variants in rank
 *           order. Risk is `ProductPermissions.read`'s, L0 (ADR 0132).
 * Runtime: node
 * Governing contract: ADR 0098, 0155, 0221, guides/programming-model.mdx#queries, ADR 0132; ADR
 *                     0127
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { Search } from "@stackra/search";
import type { Product } from "#modules/catalogue/models/product.model";
import { ProductPermissions } from "#modules/catalogue/permissions/product.permission";
import { ProductSearch } from "#modules/catalogue/search/product.search";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { SearchVariantsInput } from "#modules/catalogue/schemas/search-variants-input.schema";
import { SearchVariantsOutput } from "#modules/catalogue/schemas/search-variants-output.schema";

/** Ranked by the index, so an exact SKU outranks a word in a title. */
@Query({
  key: "variant.search",
  input: SearchVariantsInput,
  output: SearchVariantsOutput,
  permission: ProductPermissions.read,
  actors: [ActorKind.User, ActorKind.Service],
  intents: ["find item by sku", "look up a product at the till"],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/variants" })
export class SearchVariantsQuery {
  /** @param search - the @stackra/search reader over the declared product index. */
  constructor(private readonly search: Search) {}

  /** Flattens the ranked products into variant hits and stops at `limit`. */
  async handle(input: SearchVariantsInput, ctx: QueryContext): Promise<SearchVariantsOutput> {
    const products: Product[] = await this.search.in(ProductSearch).find(input.q, {
      filters: { status: ProductStatus.Active },
      limit: input.limit,
      populate: ["variants"],
    });
    const items = products.flatMap((p) =>
      p.variants.map((v) => ({
        variantId: v.id,
        productId: p.id,
        sku: v.sku,
        title: p.title.in(ctx.locale),
        trackInventory: v.trackInventory,
      })),
    );
    return { items: items.slice(0, input.limit) };
  }
}
