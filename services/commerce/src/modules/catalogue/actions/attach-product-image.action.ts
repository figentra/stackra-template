/**
 * Stackra file contract:
 * Purpose: `catalogue.product.attach_image@1`: add an uploaded image to a product's storefront
 *          images.
 * Boundary: one transaction. The bytes never pass through the service: the client asked
 *           @stackra/media for a signed upload URL of the product-images bucket, uploaded, and
 *           sends the `Upload` token here; `MediaLibrary.claim` checks the token, moves the file
 *           out of the upload area and returns its public URL. The key's verb is not a permission
 *           verb, so the permission is named (`update`). The path is kept as
 *           `POST /products/:productId/images` (a repeat adds a second image) instead of the
 *           derived one.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16 and 21), ADR 0098, ADR 0234, ADR 0130 (file
 *                     upload)
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { MediaLibrary } from "@stackra/media";
import { ProductPermissions } from "#modules/catalogue/access/product.permissions";
import { ProductImagesBucket } from "#modules/catalogue/models/product-images.bucket";
import type { AttachProductImageInput } from "#modules/catalogue/schemas/attach-product-image-input.schema";
import type { ProductView } from "#modules/catalogue/schemas/product-view.schema";
import type { ProductService } from "#modules/catalogue/services/product.service";

/** Appends the image; the first image of a product becomes its card image on the storefront. */
export class AttachProductImageAction extends Action({
  key: "product.attach_image",
  permission: ProductPermissions.update,
  actors: [ActorKind.User, ActorKind.Agent],
  endpoint: {
    method: HttpMethod.Post,
    path: "/products/:productId/images",
  },
}) {
  /**
   * @param media - the @stackra/media library; it owns storage, variants and upload tokens.
   */
  constructor(
    private readonly products: ProductService,
    private readonly media: MediaLibrary,
  ) {
    super();
  }

  /**
   * Claims the upload, then records its URL on the product.
   * @throws Refusal `not_found` for an unknown id in this tenant, or the media package's refusal
   *         for an expired, foreign or unfinished upload.
   */
  async handle(input: AttachProductImageInput, ctx: ActionContext): Promise<ProductView> {
    const product = await this.products.findOneOrFail(
      { id: input.productId },
      { populate: ["variants"] },
    );
    await ctx.authorize(product);
    const file = await this.media.claim(input.image, ProductImagesBucket);
    product.images = [...product.images, { url: file.url, alt: input.alt }];
    return this.products.toView(product, ctx.locale);
  }
}
