/**
 * Stackra file contract:
 * Purpose: `catalogue.product.attach_image`: add an uploaded image to a product's storefront
 *          images.
 * Boundary: one transaction. The bytes never pass through the service: the client asked
 *           @stackra/media for a signed upload URL of the product-images bucket, uploaded, and
 *           sends the `Upload` token here; `MediaLibrary.claim` checks the token, moves the file
 *           out of the upload area and returns its public URL. POST, because a repeat adds a second
 *           image.
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0234, ADR 0127, ADR 0130 (file upload)
 */
import { Action, type ActionContext, AsEndpoint, UxAfter } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { MediaLibrary } from "@stackra/media";
import { I18n } from "#stackra/i18n";
import type { ProductService } from "#modules/catalogue/services/product.service";
import { ProductPermissions } from "#modules/catalogue/permissions/product.permission";
import { ProductImagesBucket } from "#modules/catalogue/buckets/product-images.bucket";
import { AttachProductImageInput } from "#modules/catalogue/schemas/attach-product-image-input.schema";
import { ProductView } from "#modules/catalogue/schemas/product-view.schema";

/** Appends the image; the first image of a product becomes its card image on the storefront. */
@Action({
  key: "product.attach_image",
  input: AttachProductImageInput,
  output: ProductView,
  permission: ProductPermissions.update,
  actors: [ActorKind.User, ActorKind.Agent],
  ux: { success: I18n.catalogue.product.image_attached, after: [UxAfter.Refresh] },
})
@AsEndpoint({ method: HttpMethod.Post, path: "/products/:productId/images" })
export class AttachProductImageAction {
  /** @param media - the @stackra/media library; it owns storage, variants and upload tokens. */
  constructor(
    private readonly products: ProductService,
    private readonly media: MediaLibrary,
  ) {}

  /**
   * Claims the upload, then records its URL on the product.
   * @throws AppError `not_found` / `product_not_found` for an unknown id in this tenant, or the
   *         media package's refusal for an expired, foreign or unfinished upload.
   */
  async handle(input: AttachProductImageInput, ctx: ActionContext): Promise<ProductView> {
    const product = await this.products.findOneOrFail(
      { id: input.productId },
      { populate: ["variants"] },
    );
    await ctx.authorize(ProductPermissions.update, product);
    const file = await this.media.claim(input.image, ProductImagesBucket);
    product.images = [...product.images, { url: file.url, alt: input.alt }];
    return this.products.toView(product, ctx.locale);
  }
}
