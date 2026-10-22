/**
 * Stackra file contract:
 * Purpose: the typed extension loyalty adds to `orders.order.create` input:
 *          `extensions.loyalty.redeemPoints`.
 * Boundary: schema class only. Gen merges it into the action's input schema, openapi.json and every
 *           generated client, so a caller sees `extensions: { loyalty?: { redeemPoints: number } }`
 *           without orders knowing loyalty exists.
 * Runtime: isomorphic
 * Governing contract: ADR 0265 (typed extensions), guides/programming-model.mdx#hooks
 */
import { Schema, z } from "@stackra/schema";

/**
 * How many points the customer wants to spend on this order; the hook caps it by balance and by the
 * kit's percentage.
 */
export class RedeemPointsExtension extends Schema(
  z.object({ redeemPoints: z.number().int().min(1).max(1_000_000) }),
) {}
