/**
 * Stackra file contract:
 * Purpose: `OrderAdjustment`: one amount a hook implementer added to or took off an order.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0220 (integer minor units),
 *                     guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/**
 * One amount a hook implementer added to or took off an order. `code` is owned by the module that
 * added it (an enum
 * value, e.g. `loyalty_points`); `label` is an i18n key; `amountMinor` is negative for a discount.
 */
export class OrderAdjustment extends Schema(
  z.object({ code: z.string(), label: z.string(), amountMinor: z.number().int() }),
) {}
