/**
 * Stackra file contract:
 * Purpose: the orders part of the `demo` profile: three orders for the demo customer (two paid),
 *          one for another.
 * Boundary: synthetic rows from this module's factories with fixed public ids in the ADR 0231 form
 *           (`<prefix>_<26 characters>`, `01JA` plus a counter), which console e2e tests and the
 *           mobile Maestro flows name: `ord_01JA0000000000000000000001` and `…02` paid, `…03`
 *           pending, `…04` another customer's. The variant id is catalogue's seeded public id
 *           (`var_01JA0000000000000000000001`, the M tee), named as data, never imported (section
 *           5). Seeder key `orders.demo`; it runs after `catalogue.demo` and `inventory.demo`. The
 *           e2e test login: the identity stub signs every e2e run in as the demo customer
 *           `usr_01JA0000000000000000000001`, who holds 1,000 points from `loyalty_kit.demo`.
 * Runtime: node
 * Governing contract: ADR 0190 (profiles minimal, demo, test), guides/programming-model.mdx#seeds
 */
import { Seeder, type SeedContext } from "@stackra/database";
import { OrderFactory } from "#modules/orders/factories/order.factory";
import { OrderLineFactory } from "#modules/orders/factories/order-line.factory";

/** `ord_01JA0000000000000000000003` is the pending order an e2e test may cancel. */
export class OrdersDemoSeeder extends Seeder {
  /** The profiles this seeder belongs to. */
  static readonly profiles = ["demo"] as const;

  /** Writes the four orders, each with one line of the seeded M tee. */
  async run({ em }: SeedContext): Promise<void> {
    const customerId = "usr_01JA0000000000000000000001";
    const line = { variantId: "var_01JA0000000000000000000001", unitPriceMinor: 1_000 };
    const demo = new OrderFactory(em).has(OrderLineFactory, 1, line);
    await demo.state("paid").createOne({ id: "ord_01JA0000000000000000000001", customerId });
    await demo.state("paid").createOne({ id: "ord_01JA0000000000000000000002", customerId });
    await demo.createOne({ id: "ord_01JA0000000000000000000003", customerId });
    await new OrderFactory(em).createOne({
      id: "ord_01JA0000000000000000000004",
      customerId: "usr_01JA0000000000000000000002",
    });
  }
}
