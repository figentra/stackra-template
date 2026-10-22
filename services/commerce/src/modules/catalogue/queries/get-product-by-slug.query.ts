/**
 * Stackra file contract:
 * Purpose: `catalogue.product.get_by_slug`, PUBLIC area: the storefront's product page lookup by
 *          URL segment, returning the storefront projection (images, price, options, stock, seo,
 *          collections).
 * Boundary: read only; only Active products resolve, so a draft or archived slug is a 404 to the
 *           public site. Anonymous callers hold the public area's read grant; the market and locale
 *           come from the request. Public paths start with `/public` (ADR 0231).
 * Runtime: node
 * Governing contract: ADR 0098, 0082, 0155, guides/programming-model.mdx#queries, ADR 0231;
 *                     apps/web `routes/product.route.ts`
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ActorKind, ApiArea, HttpMethod } from "@stackra/contracts";
import { ProductService } from "#modules/catalogue/services/product.service";
import { StorefrontService } from "#modules/catalogue/services/storefront.service";
import { ProductPermissions } from "#modules/catalogue/permissions/product.permission";
import { GetProductBySlugInput } from "#modules/catalogue/schemas/get-product-by-slug-input.schema";
import { StorefrontProductView } from "#modules/catalogue/schemas/storefront-product-view.schema";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { ProductNotFoundError } from "#modules/catalogue/errors/product-not-found.error";

/** One indexed read (`idx_products_tenant_id_slug`), one price quote, one stock read. */
@Query({
  key: "product.get_by_slug",
  area: ApiArea.Public,
  input: GetProductBySlugInput,
  output: StorefrontProductView,
  permission: ProductPermissions.read,
  actors: [ActorKind.Anonymous, ActorKind.User, ActorKind.Agent, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/public/products/by-slug/:slug" })
export class GetProductBySlugQuery {
  constructor(
    private readonly products: ProductService,
    private readonly storefront: StorefrontService,
  ) {}

  /**
   * Resolves an Active product by slug and projects it for the storefront.
   * @throws ProductNotFoundError for an unknown, draft or archived slug alike.
   */
  async handle(input: GetProductBySlugInput, ctx: QueryContext): Promise<StorefrontProductView> {
    const product = await this.products.findOne(
      { slug: input.slug, status: ProductStatus.Active },
      { populate: ["variants"] },
    );
    if (!product) throw new ProductNotFoundError({ slug: input.slug });
    return this.storefront.toView(product, { locale: ctx.locale, market: ctx.market });
  }
}
