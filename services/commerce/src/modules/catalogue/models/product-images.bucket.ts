/**
 * Stackra file contract:
 * Purpose: the `catalogue.product_images` bucket: where product images upload, which types and
 *          sizes it accepts, and the variants @stackra/media derives.
 * Boundary: a declaration; the key is derived from the file (`catalogue.product_images`). Gen lists
 *           it in the manifest `infra.buckets` and the member runway sizes it. Uploads go straight
 *           to storage through a signed URL; the service only claims the finished upload
 *           (actions/attach-product-image.action.ts).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0234, ADR 0130 (file upload)
 */
import { Bucket, BucketVisibility, MediaType } from "@stackra/media";

/** Public read (storefront images), at most 5 MB, three web formats, a card and a zoom variant. */
export class ProductImagesBucket extends Bucket({
  visibility: BucketVisibility.Public,
  maxBytes: 5_000_000,
  accept: [MediaType.Jpeg, MediaType.Png, MediaType.Webp],
  variants: {
    card: { width: 600 },
    zoom: { width: 1_600 },
  },
}) {}
