/**
 * Stackra file contract:
 * Purpose: proves the list narrows a customer to their own orders and pages with a cursor.
 * Boundary: unit tier through the pipeline, memory drivers, three orders for one customer and one
 *           for another, all from the factory.
 * Runtime: node
 * Governing contract: cursor pagination in the HTTP conventions, ADR 0022
 */
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { CommerceModule } from "#stackra/module";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";

/** Realm narrowing and the one-more-row paging trick. */
describe(ListOrdersQuery, () => {
  /** Two pages of two and one: the fourth order belongs to another customer and never appears. */
  it("shows a customer only their own orders, one page at a time", async () => {
    await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const mine = await OrderFactory.new().create();
    await OrderFactory.new().count(2).create({ customerId: mine.customerId });
    await OrderFactory.new().create();
    const me = actors.customer(mine.customerId);

    const first = await run(ListOrdersQuery, { limit: 2 }, { as: me });
    expect(first.output.items).toHaveLength(2);
    expect(first.output.hasMore).toBe(true);

    const cursor = first.output.nextCursor;
    const second = await run(ListOrdersQuery, { limit: 2, cursor }, { as: me });
    expect(second.output).toMatchObject({ hasMore: false });
    expect(second.output.items).toHaveLength(1);
    expect(second.output).not.toHaveProperty("nextCursor");
  });
});
