/**
 * Stackra file contract:
 * Purpose: builds OrderLine rows; used through `OrderFactory.new().has(OrderLineFactory.new())`.
 * Boundary: bound to OrderLine by the type argument (`Factory<OrderLine>`). The order comes from
 *           the parent factory (`has`) or from `for(order)`; the variant is a link, so it takes a
 *           `var_…` id, and a caller passes catalogue's real id when stock must match.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 28), ADR 0190
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import { Money } from "@stackra/money";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import type { OrderLine } from "#modules/orders/models/order-line.model";

/** One unit of a random variant id at a random price in USD. */
export class OrderLineFactory extends Factory<OrderLine> {
  /** The default attributes of one line; a parent factory replaces `order`. */
  definition(faker: Faker): Attributes<OrderLine> {
    return {
      order: OrderFactory.new(),
      variant: faker.publicId("var"),
      quantity: 1,
      unitPrice: Money.ofMinor(faker.number.int({ min: 100, max: 10_000 }), "USD"),
    };
  }
}
