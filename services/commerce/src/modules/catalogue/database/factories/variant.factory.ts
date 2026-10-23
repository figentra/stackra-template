/**
 * Stackra file contract:
 * Purpose: builds Variant rows; used through `ProductFactory.new().has(VariantFactory.new())`.
 * Boundary: bound to Variant by the type argument (`Factory<Variant>`). The product comes from the
 *           parent factory (`has`) or from `for(product)`; standing alone, it makes an active
 *           product.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 28), ADR 0190
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";
import type { Variant } from "#modules/catalogue/models/variant.model";

/** A tracked variant with a random SKU, a 13-digit barcode and a size. */
export class VariantFactory extends Factory<Variant> {
  /** The default attributes of one variant; a parent factory replaces `product`. */
  definition(faker: Faker): Attributes<Variant> {
    return {
      product: ProductFactory.new(),
      sku: faker.string.alphanumeric({ length: 8, casing: "upper" }),
      barcode: faker.string.numeric(13),
      options: { size: faker.helpers.arrayElement(["S", "M", "L"]) },
    };
  }
}
