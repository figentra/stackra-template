/**
 * Stackra file contract:
 * Purpose: `catalogue.product.get`: one product by public id. An L0 query, so it is also an MCP
 *          tool automatically.
 * Boundary: no transaction; the cache is the service's @Cacheable, invalidated by model tag on
 *           archive.
 * Runtime: node
 * Governing contract: ADR 0098, 0155, guides/programming-model.mdx#queries
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ProductService } from "#modules/catalogue/services/product.service";
import { ProductPermissions } from "#modules/catalogue/permissions/product.permission";
import { GetProductInput } from "#modules/catalogue/schemas/get-product-input.schema";
import { ProductView } from "#modules/catalogue/schemas/product-view.schema";
import { ActorKind, HttpMethod } from "@stackra/contracts";

/** Reads one product as ProductView; no record-level policy, the permission alone decides. */
@Query({
  key: "product.get",
  input: GetProductInput,
  output: ProductView,
  permission: ProductPermissions.read,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/products/:productId" })
export class GetProductQuery {
  constructor(private readonly products: ProductService) {}

  /**
   * Returns the cached view of one product in the request locale.
   * @throws AppError `not_found` / `product_not_found` from the service; the adapter maps it to
   * 404.
   */
  async handle(input: GetProductInput, ctx: QueryContext): Promise<ProductView> {
    return this.products.view(input.productId, ctx.locale);
  }
}
