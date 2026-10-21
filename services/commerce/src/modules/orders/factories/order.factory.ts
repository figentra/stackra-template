/**
 * Stackra file contract:
 * Purpose: builds Order rows with named states for tests and seeds; the one owner of a "typical
 *          order".
 * Boundary: extends the MikroORM Factory through @stackra/database/testing, which patches Faker in
 *           (MikroORM 7 bundles none). Only tests and seeds import factories; tests read the ids
 *           the factory returns instead of typing them.
 * Runtime: node
 * Governing contract: ADR 0190 (factories with states), ADR 0269 (helper placement),
 *                     guides/programming-model.mdx#factories
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { Order } from "#modules/orders/models/order.model";
import { Cancelled, Paid, PendingPayment } from "#modules/orders/states/order.state";

/** A payments-service id; the prefix belongs to payments, so it is spelled once, here. */
const paymentId = (faker: Faker): string =>
  `pay_${faker.string.alphanumeric({ length: 26, casing: "lower" })}`;

/**
 * Builds records for tests and seeds; only tests and seeds import it.
 *
 * @example
 * const order = await new OrderFactory(em).state("paid").createOne();
 * new OrderFactory(em).has(OrderLineFactory, 2).makeMany(3);
 */
export class OrderFactory extends Factory<Order> {
  /** The model this factory builds. */
  model = Order;

  /** A pending order in USD with a random subtotal, no adjustments, for a random customer. */
  protected definition(faker: Faker): Partial<Order> {
    const subtotalMinor = faker.number.int({ min: 500, max: 50_000 });
    return {
      customerId: `usr_${faker.string.alphanumeric({ length: 26, casing: "lower" })}`,
      status: new PendingPayment(),
      currency: "USD",
      subtotalMinor,
      adjustments: [],
      totalMinor: subtotalMinor,
      paymentId: null,
      paidAt: null,
    };
  }

  /** Named states; `.state("paid")` merges one on top of the definition. */
  protected states = {
    authorized: (faker: Faker): Partial<Order> => ({ paymentId: paymentId(faker) }),
    paid: (faker: Faker): Partial<Order> => ({
      status: new Paid(),
      paymentId: paymentId(faker),
      paidAt: faker.date.recent(),
    }),
    cancelled: (): Partial<Order> => ({ status: new Cancelled() }),
  };
}
