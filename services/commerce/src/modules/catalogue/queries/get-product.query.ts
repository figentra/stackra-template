/**
 * Stackra file contract:
 * Purpose: `catalogue.product.get@1`: one product by public id, as ProductView.
 * Boundary: read only, no transaction. The permission is derived (`ProductPermissions.read`, L0),
 *           so it is also an MCP tool under the caller's permissions; the endpoint is derived
 *           (`GET /products/:productId`). The view comes from ProductService's ten-minute cache,
 *           which ArchiveProductAction forgets.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0155
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, type PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { ProductView } from "#modules/catalogue/schemas/product-view.schema";
import type { ProductService } from "#modules/catalogue/services/product.service";

/** The product to read, by public id. */
export class GetProductInput extends Schema {
  /** The product's public id. */
  productId!: PublicId<"prd">;
}

/** No record rule: the permission alone decides; also the View page of ProductResource. */
export class GetProductQuery extends Query({
  key: "product.get",
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
}) {
  /** @param products - serves the cached view in the request locale. */
  constructor(private readonly products: ProductService) {
    super();
  }

  /**
   * Returns the cached view of one product in the request locale.
   * @throws ProductNotFoundError when no product has this id in the actor's tenant.
   */
  async handle(input: GetProductInput, ctx: QueryContext): Promise<ProductView> {
    return this.products.view(input.productId, ctx.locale);
  }
}
