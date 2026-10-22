/**
 * Stackra file contract:
 * Purpose: `AttachProductImageInput`: which product, the finished upload, and its alt text.
 * Boundary: one schema class and its inferred type (ADR 0006). `image` is an `Upload` of the
 *           product-images bucket: a token for a file the client already put through a signed URL,
 *           checked by @stackra/media against the bucket's types and size. Never raw bytes.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0234, guides/programming-model.mdx#schemas, ADR 0130 (file
 *                     upload)
 */
import { Upload } from "@stackra/media";
import { Schema, z } from "@stackra/schema";
import { ProductImagesBucket } from "#modules/catalogue/buckets/product-images.bucket";

/** The product by public id, the upload token, and the alt text (null falls back to the title). */
export class AttachProductImageInput extends Schema(
  z.object({
    productId: z.string(),
    image: Upload.of(ProductImagesBucket),
    alt: z.string().max(200).nullable(),
  }),
) {}
