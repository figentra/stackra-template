/**
 * Stackra file contract:
 * Purpose: the "order support" skill: instructions loaded on demand plus the tools an agent may
 *          use.
 * Boundary: the instructions are the module asset bound by name (`orders::ai/orders-support.md`).
 *           Tools are referenced by class; gen fails on a class that is not an exposed tool (an
 *           action with `tool: true`, or an L0 or L1 query).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 13 and 16), ADR 0245 (skills, progressive disclosure),
 *                     ADR 0155
 */
import { Skill } from "@stackra/ai";
import { CancelOrderAction } from "#modules/orders/actions/cancel-order.action";
import { GetOrderQuery } from "#modules/orders/queries/get-order.query";
import { ListOrdersQuery } from "#modules/orders/queries/list-orders.query";

/** Loaded when the intent router matches an order question. */
export class OrdersSupportSkill extends Skill({
  tools: [GetOrderQuery, ListOrdersQuery, CancelOrderAction],
}) {
  /** Few-shot examples; `calls` reference tool classes, so a renamed action breaks the build. */
  readonly examples = [
    {
      input: "cancel my last order",
      calls: [
        { tool: ListOrdersQuery, input: { limit: 1 } },
        { tool: CancelOrderAction, input: { orderId: "$0.items[0].id" } },
      ],
    },
  ];
}
