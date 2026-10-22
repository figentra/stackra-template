/**
 * Stackra file contract:
 * Purpose: builds Product rows for tests and seeds; variants come from `.has(VariantFactory, n)`.
 * Boundary: only tests and seeds import factories.
 * Runtime: node
 * Governing contract: ADR 0190, guides/programming-model.mdx#factories
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { Product } from "#modules/catalogue/models/product.model";
import { Active, Draft } from "#modules/catalogue/states/product.state";

/**
 * Builds records for tests and seeds; only tests and seeds import it.
 *
 * @example
 * await new ProductFactory(em).has(VariantFactory, 2).createOne({ slug: "demo-tee" });
 */
export class ProductFactory extends Factory<Product> {
  /** The model this factory builds. */
  model = Product;

  /** An Active product with an English and Arabic title and a slug derived from it. */
  protected definition(faker: Faker): Partial<Product> {
    const name = faker.commerce.productName();
    return {
      title: { en: name, ar: `منتج ${faker.number.int(999)}` },
      slug: faker.helpers.slugify(name).toLowerCase(),
      status: new Active(),
      description: null,
      images: [{ url: faker.image.urlPicsumPhotos({ width: 800, height: 800 }), alt: null }],
      collections: [],
      seo: null,
    };
  }

  /** Named states; `.state(name)` merges one on top of the definition. */
  protected states = {
    draft: (): Partial<Product> => ({ status: new Draft() }),
  };
}
