/**
 * Stackra file contract:
 * Purpose: builds Product rows with named states for tests and seeders; variants come from
 *          `.has(VariantFactory.new())`.
 * Boundary: bound to Product by the type argument (`Factory<Product>`). Laravel's API: `new`,
 *           `count`, `state`, `for`, `has`, `sequence`, `make` and `create`; a named state is a
 *           method. Faker comes from @stackra/database/testing, so only tests and seeders import a
 *           factory and Faker never reaches a runtime entry. The storefront fields keep the model's
 *           defaults (no description, collections or seo).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 16), ADR 0190 (factories with states)
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import type { Product } from "#modules/catalogue/models/product.model";

/**
 * An active product with an English and an Arabic title, a slug derived from it and one image.
 *
 * @example
 * const product = await ProductFactory.new().has(VariantFactory.new().count(2)).create();
 * const hidden = await ProductFactory.new().draft().create({ slug: "demo-draft" });
 */
export class ProductFactory extends Factory<Product> {
  /** The default attributes of one product; tests override what they assert on. */
  definition(faker: Faker): Attributes<Product> {
    const name = faker.commerce.productName();
    return {
      title: { en: name, ar: `منتج ${faker.number.int(999)}` },
      slug: faker.helpers.slugify(name).toLowerCase(),
      status: ProductStatus.Active,
      images: [{ url: faker.image.urlPicsumPhotos({ width: 800, height: 800 }), alt: null }],
    };
  }

  /** Being set up; invisible to customers. */
  draft(): this {
    return this.state({ status: ProductStatus.Draft });
  }
}
