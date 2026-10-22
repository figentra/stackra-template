/**
 * Stackra file contract:
 * Purpose: the params of `CreateOrderRoute`: an optional variant to pre-fill, as the scanner hands
 *          it over.
 * Boundary: a schema class; everything optional so `orders/new` opens with an empty sheet.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082
 */
import { PublicId, Schema, z } from "@stackra/schema";

/** The create-order screen's params, such as `orders/new?variantId=var_…`. */
export class CreateOrderParams extends Schema(
  z.object({ variantId: PublicId("var").optional() }),
) {}
