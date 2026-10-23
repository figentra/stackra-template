/**
 * Stackra file contract:
 * Purpose: the orders part of the `demo` profile: three orders for the first demo customer (two
 *          paid), one for the second.
 * Boundary: the profile is the file name and the key is `orders.demo`; it runs after
 *           `catalogue.demo`, `inventory.demo` and `loyalty_kit.demo` (stackra.config.ts `e2e`).
 *           Synthetic rows from this module's factories with fixed public ids in the ADR 0231 form
 *           (`<prefix>_<26 characters>`, `01JA` plus a counter), declared once in `ids`, which
 *           console e2e tests and the mobile Maestro flows name. The customers are the loyalty
 *           kit's demo principals, imported from its ./testing entry, so no principal id is typed
 *           here; the e2e identity stub signs in as `bronze`, who holds 1,000 points. The variant
 *           is catalogue's M tee, named as data: a sibling module's seeder is not one of its
 *           public groups.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 24), ADR 0190 (profiles minimal, demo and
 *                     test), ADR 0231 (public ids)
 */
import { LoyaltyKitDemoSeeder } from "@acme/loyalty-kit/testing";
import { Seeder } from "@stackra/database";
import { Money } from "@stackra/money";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { OrderLineFactory } from "#modules/orders/database/factories/order-line.factory";

/** Catalogue's seeded M tee (`catalogue.demo`); every demo line sells one of it. */
const MEDIUM_TEE = "var_01JA0000000000000000000001";

/** `ids.pending` is the pending order an e2e test may cancel. */
export class OrdersDemoSeeder extends Seeder {
  /** The only place these order ids are typed. */
  static readonly ids = {
    paidFirst: "ord_01JA0000000000000000000001",
    paidSecond: "ord_01JA0000000000000000000002",
    pending: "ord_01JA0000000000000000000003",
    otherCustomer: "ord_01JA0000000000000000000004",
  } as const;

  /** Writes the four orders, each of the first customer's with one line of the M tee. */
  async run(): Promise<void> {
    const { ids } = OrdersDemoSeeder;
    const { bronze, silver } = LoyaltyKitDemoSeeder.ids;
    const line = OrderLineFactory.new().state({
      variant: MEDIUM_TEE,
      unitPrice: Money.ofMinor(1_000, "USD"),
    });
    await OrderFactory.new().paid().has(line).create({ id: ids.paidFirst, customerId: bronze });
    await OrderFactory.new().paid().has(line).create({ id: ids.paidSecond, customerId: bronze });
    await OrderFactory.new().has(line).create({ id: ids.pending, customerId: bronze });
    await OrderFactory.new().create({ id: ids.otherCustomer, customerId: silver });
  }
}
