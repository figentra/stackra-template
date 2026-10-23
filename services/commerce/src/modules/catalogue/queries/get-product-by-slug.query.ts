/**
 * Stackra file contract:
 * Purpose: `catalogue.product.get_by_slug@1`, public area: the storefront's product page lookup by
 *          URL segment, returning the storefront projection (images, price, options, stock, seo,
 *          collections).
 * Boundary: read only. Only active products resolve, so a draft or archived slug is a 404 to the
 *           public site. Anonymous callers hold the public area's read grant (the permission is
 *           derived, `ProductPermissions.read`); the market and locale come from the request. The
 *           path is kept as `/public/products/by-slug/:slug` instead of the derived one.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0082 (public area),
 *                     ADR 0155, ADR 0231
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, ApiArea, HttpMethod } from "@stackra/contracts";
import { Schema, Str } from "@stackra/validation";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { ProductNotFoundError } from "#modules/catalogue/errors/product-not-found.error";
import type { StorefrontProductView } from "#modules/catalogue/schemas/storefront-product-view.schema";
import type { ProductService } from "#modules/catalogue/services/product.service";
import type { StorefrontService } from "#modules/catalogue/services/storefront.service";

/** The product to read, by its tenant-unique slug. */
export class GetProductBySlugInput extends Schema {
  /** The storefront URL segment. */
  @Str({ max: 200 })
  slug!: string;
}

/** One indexed read (`idx_products_tenant_id_slug`), one price quote, one stock read. */
export class GetProductBySlugQuery extends Query({
  key: "product.get_by_slug",
  area: ApiArea.Public,
  actors: [ActorKind.Anonymous, ActorKind.User, ActorKind.Agent, ActorKind.Service],
  endpoint: {
    method: HttpMethod.Get,
    path: "/public/products/by-slug/:slug",
  },
}) {
  /** @param storefront - prices and stocks the product for the request's market. */
  constructor(
    private readonly products: ProductService,
    private readonly storefront: StorefrontService,
  ) {
    super();
  }

  /**
   * Resolves an active product by slug and projects it for the storefront.
   * @throws ProductNotFoundError for an unknown, draft or archived slug alike.
   */
  async handle(input: GetProductBySlugInput, ctx: QueryContext): Promise<StorefrontProductView> {
    const product = await this.products.findOne(
      { slug: input.slug, status: ProductStatus.Active },
      { populate: ["variants"] },
    );
    if (!product) throw ProductNotFoundError.create({ slug: input.slug });
    return this.storefront.toView(product, ctx);
  }
}
