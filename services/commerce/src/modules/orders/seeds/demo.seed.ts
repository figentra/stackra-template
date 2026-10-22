/**
 * Stackra file contract:
 * Purpose: the orders part of the `demo` profile: three orders for the demo customer (two paid),
 *          one for another.
 * Boundary: synthetic rows from this module's factories with fixed public ids in the ADR 0231 form
 *           (`<prefix>_<26 characters>`, `01JA` plus a counter), declared once in
 *           `OrdersDemoSeeder.ids`, which console e2e tests and the mobile Maestro flows name. The
 *           customers are the loyalty kit's demo principals, imported from `DemoSeeder.ids`, so no
 *           principal id is typed here; the identity stub signs every e2e run in as `bronze`, who
 *           holds 1,000 points from `loyalty_kit.demo`. The variant is catalogue's M tee
 *           (`var_01JA0000000000000000000001`), named as data, never imported: a sibling module's
 *           seeder is not a declaration file. Seeder key `orders.demo`; it runs after
 *           `catalogue.demo`, `inventory.demo` and `loyalty_kit.demo`.
 * Runtime: node
 * Governing contract: ADR 0190 (profiles minimal, demo, test), ADR 0231 (public ids),
 *                     guides/programming-model.mdx#seeds
 */
import { Seeder, type SeedContext } from "@stackra/database";
import { DemoSeeder } from "@acme/loyalty-kit/testing";
import { OrderFactory } from "#modules/orders/factories/order.factory";
import { OrderLineFactory } from "#modules/orders/factories/order-line.factory";

/** `ids.pending` is the pending order an e2e test may cancel. */
export class OrdersDemoSeeder extends Seeder {
  /** The profiles this seeder belongs to. */
  static readonly profiles = ["demo"] as const;

  /** The only place these order ids are typed. */
  static readonly ids = {
    paidFirst: "ord_01JA0000000000000000000001",
    paidSecond: "ord_01JA0000000000000000000002",
    pending: "ord_01JA0000000000000000000003",
    otherCustomer: "ord_01JA0000000000000000000004",
  } as const;

  /** Writes the four orders, each with one line of the seeded M tee. */
  async run({ em }: SeedContext): Promise<void> {
    const { ids } = OrdersDemoSeeder;
    const customerId = DemoSeeder.ids.bronze;
    const line = { variantId: "var_01JA0000000000000000000001", unitPriceMinor: 1_000 };
    const demo = new OrderFactory(em).has(OrderLineFactory, 1, line);
    await demo.state("paid").createOne({ id: ids.paidFirst, customerId });
    await demo.state("paid").createOne({ id: ids.paidSecond, customerId });
    await demo.createOne({ id: ids.pending, customerId });
    await new OrderFactory(em).createOne({
      id: ids.otherCustomer,
      customerId: DemoSeeder.ids.silver,
    });
  }
}
