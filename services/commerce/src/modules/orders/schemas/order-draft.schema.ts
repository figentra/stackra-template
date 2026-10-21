/**
 * Stackra file contract:
 * Purpose: `OrderDraft`: the order as hooks see it: the customer (from the actor), the quote
 *          currency, priced lines and `extensions`, a map from extender namespace to that
 *          extender's declared input (`extensions.loyalty` for the loyalty module).
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0265 (typed extensions), guides/programming-model.mdx#schemas,
 *                     guides/programming-model.mdx#hooks
 */
import { Schema, z } from "@stackra/schema";
import { PricedLine } from "#modules/orders/schemas/priced-line.schema";

/**
 * The order as hooks see it: the customer (from the actor), the quote currency, priced lines and
 * `extensions`, a map
 * from extender namespace to that extender's declared input (`extensions.loyalty` for the loyalty
 * module).
 */
export class OrderDraft extends Schema(
  z.object({
    customerId: z.string(),
    currency: z.string().length(3),
    lines: PricedLine.schema.array().min(1),
    extensions: z.record(z.string(), z.unknown()).default({}),
  }),
) {}
