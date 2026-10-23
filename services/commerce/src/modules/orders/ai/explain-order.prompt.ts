/**
 * Stackra file contract:
 * Purpose: the `explain-order` MCP prompt: renders an order's facts into a customer-facing
 *          explanation.
 * Boundary: the template and its evaluation set are module assets bound by name
 *           (`orders::ai/explain-order.md` and `orders::ai/explain-order.eval.json`), so they are
 *           reviewed like code and translated like text. The arguments are the companion
 *           ExplainOrderInput, whose JSON Schema gen writes into the MCP prompt listing. Version 1
 *           until `version:` says otherwise; an older version stays callable for 12 months.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 2, 13 and 16), ADR 0245 (versioned prompts with
 *                     evaluations), ADR 0234, ADR 0118
 */
import { Prompt } from "@stackra/ai";
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The order to explain, by public id. */
export class ExplainOrderInput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;
}

/** Evaluated in CI against the cases in the evaluation asset; a regression fails the gate. */
export class ExplainOrderPrompt extends Prompt {}
