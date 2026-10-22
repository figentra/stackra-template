/**
 * Stackra file contract:
 * Purpose: the `explain-order` MCP prompt: renders order facts into a customer-facing explanation.
 * Boundary: the template and its evaluation set ship as module assets so they are reviewed like
 *           code and translated like text. Version 1 until @Version says otherwise; old versions
 *           stay callable for 12 months.
 * Runtime: isomorphic
 * Governing contract: ADR 0245 (versioned prompts with evaluations), ADR 0234, ADR 0118,
 *                     guides/programming-model.mdx#ai
 */
import { Prompt } from "@stackra/ai";
import { Assets } from "#stackra/assets";
import { ExplainOrderArgs } from "#modules/orders/schemas/explain-order-args.schema";

/** Evaluated in CI against the cases in the eval asset; a regression fails the gate. */
@Prompt({
  template: Assets.orders.ai.explain_order_md,
  arguments: ExplainOrderArgs,
  evaluation: Assets.orders.ai.explain_order_eval_json,
})
export class ExplainOrderPrompt {}
