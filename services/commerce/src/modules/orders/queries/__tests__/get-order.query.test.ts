/**
 * Stackra file contract:
 * Purpose: proves a customer reads their own order and is refused another customer's, and that a
 *          service acting for the owner reads it too.
 * Boundary: unit tier through the pipeline; memory drivers; records from the factory.
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0132 d4, ADR 0022
 */
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { ForbiddenError } from "@stackra/errors";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { CommerceModule } from "#stackra/module";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { GetOrderQuery } from "#modules/orders/queries/get-order.query";

/** Guards the one-order read, where OrderPolicy#read narrows customers to their own orders. */
describe(GetOrderQuery, () => {
  /** Owner allowed, stranger refused, the notifications service on behalf of the owner allowed. */
  it("applies OrderPolicy#read per record", async () => {
    await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const [order, other] = await OrderFactory.new().count(2).create();
    const input = { orderId: order.id };
    const relay = actors.service("notifications", {
      onBehalfOf: actors.customer(order.customerId),
    });

    const own = await run(GetOrderQuery, input, { as: actors.customer(order.customerId) });
    const foreign = await run(GetOrderQuery, input, { as: actors.customer(other.customerId) });
    const relayed = await run(GetOrderQuery, input, { as: relay });

    expect(own.output.id).toBe(order.id);
    expect(foreign).toRefuseWith(refusal(ForbiddenError));
    expect(relayed.output.id).toBe(order.id);
  });
});
