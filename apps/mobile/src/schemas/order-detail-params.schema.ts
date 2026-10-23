/**
 * Stackra file contract:
 * Purpose: the params of `OrderDetailRoute`: one order public id, validated before the page mounts
 *          (deep links included).
 * Boundary: a schema class; a public id, never a record (ADR 0082). A malformed id refuses the
 *           deep link with `validation` before the route's loader runs.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0082
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** `orders/:orderId`. */
export class OrderDetailParams extends Schema {
  /** The order's public id (`ord_…`). */
  orderId!: PublicId<"ord">;
}
