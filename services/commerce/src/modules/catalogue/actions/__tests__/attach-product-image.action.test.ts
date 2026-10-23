/**
 * Stackra file contract:
 * Purpose: proves an attached upload lands in the product's images and that an upload of another
 *          bucket is refused before the product changes.
 * Boundary: unit tier through the pipeline; memory drivers, so @stackra/media runs on its memory
 *           disk and `fakeUpload` stands in for a finished signed-URL upload. The product comes
 *           from the factory.
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0234, ADR 0130 (file upload), ADR 0022
 */
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { MediaType } from "@stackra/media";
import { fakeUpload } from "@stackra/media/testing";
import { describe, expect, it } from "@stackra/testing";
import { Refusals } from "#stackra/manifest";
import { CommerceModule } from "#src/commerce.module";
import { AttachProductImageAction } from "#modules/catalogue/actions/attach-product-image.action";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";
import { ProductImagesBucket } from "#modules/catalogue/models/product-images.bucket";
import { Product } from "#modules/catalogue/models/product.model";

/** Guards product images, the one place a service accepts a file. */
describe(AttachProductImageAction, () => {
  /** The claimed file's URL is appended after the existing images, with the given alt text. */
  it("appends the claimed upload to the product's images", async () => {
    const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const product = await ProductFactory.new().create();
    const image = await fakeUpload(app, ProductImagesBucket, { mediaType: MediaType.Png });

    await run(
      AttachProductImageAction,
      { productId: product.id, image, alt: null },
      { as: actors.staff() },
    );

    const saved = await app.repository(Product).findOneOrFail({ id: product.id });
    expect(saved.images.at(-1)).toEqual({ url: image.url, alt: null });
  });

  /** A token minted for another bucket must not be claimable here; the product stays as it was. */
  it("refuses an upload of another bucket", async () => {
    const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const product = await ProductFactory.new().create();
    const foreign = await fakeUpload(app, null, { mediaType: MediaType.Png });

    const result = await run(
      AttachProductImageAction,
      { productId: product.id, image: foreign, alt: null },
      { as: actors.staff() },
    );

    expect(result).toRefuseWith(refusal(Refusals.media.upload_bucket_mismatch));
    const saved = await app.repository(Product).findOneOrFail({ id: product.id });
    expect(saved.images).toEqual(product.images);
  });
});
