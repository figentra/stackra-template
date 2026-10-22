/**
 * Stackra file contract:
 * Purpose: builds Variant rows; the product comes from `.for()` or the parent factory.
 * Boundary: only tests and seeds import factories.
 * Runtime: node
 * Governing contract: ADR 0190, guides/programming-model.mdx#factories
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { Variant } from "#modules/catalogue/models/variant.model";
import { ProductFactory } from "#modules/catalogue/factories/product.factory";

/** A tracked variant with a random SKU and a 13-digit barcode. */
export class VariantFactory extends Factory<Variant> {
  /** The model this factory builds. */
  model = Variant;

  /** The default attributes of one record; tests override what they assert on. */
  protected definition(faker: Faker): Partial<Variant> {
    return {
      product: this.belongsTo(ProductFactory),
      sku: faker.string.alphanumeric({ length: 8, casing: "upper" }),
      barcode: faker.string.numeric(13),
      trackInventory: true,
      options: { size: faker.helpers.arrayElement(["S", "M", "L"]) },
    };
  }
}
