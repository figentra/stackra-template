/**
 * Stackra file contract:
 * Purpose: builds OrderLine rows; used through `OrderFactory.has(OrderLineFactory, n, overrides)`.
 * Boundary: the order comes from `.for` or the parent factory; the variant id from the override
 *           (catalogue owns it).
 * Runtime: node
 * Governing contract: ADR 0190, guides/programming-model.mdx#factories
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { OrderLine } from "#modules/orders/models/order-line.model";
import { OrderFactory } from "#modules/orders/factories/order.factory";

/**
 * One unit of a random variant id at a random price; callers pass a real `variantId` when stock
 * must match.
 */
export class OrderLineFactory extends Factory<OrderLine> {
  /** The model this factory builds. */
  model = OrderLine;

  /** The default attributes of one record; tests override what they assert on. */
  protected definition(faker: Faker): Partial<OrderLine> {
    return {
      order: this.belongsTo(OrderFactory),
      variantId: `var_${faker.string.alphanumeric({ length: 26, casing: "lower" })}`,
      quantity: 1,
      unitPriceMinor: faker.number.int({ min: 100, max: 10_000 }),
    };
  }
}
