/**
 * Stackra file contract:
 * Purpose: builds Order rows with named states for tests and seeders; the one owner of a "typical
 *          order".
 * Boundary: bound to Order by the type argument (`Factory<Order>`). Laravel's API: `new`, `count`,
 *           `state`, `for`, `has`, `sequence`, `make` and `create`; a named state is a method.
 *           Faker comes from @stackra/database/testing, so only tests and seeders import a factory
 *           and Faker never reaches a runtime entry. Tests read the ids a factory returns instead
 *           of typing them.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 16), ADR 0190 (factories with states),
 *                     ADR 0269 (helper placement)
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import { Money } from "@stackra/money";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { Order } from "#modules/orders/models/order.model";

/**
 * A pending order in USD with a random subtotal and no adjustments, for a random customer.
 *
 * @example
 * const order = await OrderFactory.new().paid().create();
 * const orders = OrderFactory.new().has(OrderLineFactory.new().count(2)).count(3).make();
 */
export class OrderFactory extends Factory<Order> {
  /** The default attributes of one order; tests override what they assert on. */
  definition(faker: Faker): Attributes<Order> {
    const subtotal = Money.ofMinor(faker.number.int({ min: 500, max: 50_000 }), "USD");
    return { customerId: faker.publicId("usr"), subtotal, total: subtotal };
  }

  /** A payment is authorized but not yet captured. */
  authorized(): this {
    return this.state((faker) => ({ paymentId: faker.publicId("pay") }));
  }

  /** The payment was captured recently. */
  paid(): this {
    return this.state((faker) => ({
      status: OrderStatus.Paid,
      paymentId: faker.publicId("pay"),
      paidAt: faker.date.recent(),
    }));
  }

  /** Ended by staff before payment. */
  cancelled(): this {
    return this.state({ status: OrderStatus.Cancelled });
  }
}
