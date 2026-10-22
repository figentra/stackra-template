/**
 * Stackra file contract:
 * Purpose: the "order support" skill: instructions loaded on demand plus the tools an agent may
 *          use.
 * Boundary: tools are referenced by class; gen fails on a class that is not an exposed tool
 *           (`@AsTool` or an L0/L1 query).
 * Runtime: isomorphic
 * Governing contract: ADR 0245 (skills, progressive disclosure), ADR 0155,
 *                     guides/programming-model.mdx#ai
 */
import { Skill } from "@stackra/ai";
import { Assets } from "#stackra/assets";
import { GetOrderQuery } from "#modules/orders/queries/get-order.query";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";
import { CancelOrderAction } from "#modules/orders/actions/cancel-order.action";

/** Loaded when the intent router matches an order question; the instructions are a module asset. */
@Skill({
  instructions: Assets.orders.ai.orders_support_md,
  tools: [GetOrderQuery, ListOrdersQuery, CancelOrderAction],
})
export class OrdersSupportSkill {
  /** Few-shot examples; `calls` reference tool classes, so a renamed action breaks the build. */
  examples = [
    {
      input: "cancel my last order",
      calls: [
        { tool: ListOrdersQuery, input: { limit: 1 } },
        { tool: CancelOrderAction, input: { orderId: "$0.items[0].id" } },
      ],
    },
  ];
}
