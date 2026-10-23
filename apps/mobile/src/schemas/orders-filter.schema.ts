/**
 * Stackra file contract:
 * Purpose: the params of `OrdersRoute`: an optional status pre-applied when the list opens from a
 *          widget or a deep link.
 * Boundary: a schema class over the producer's enum (`OrderStatus` from the generated client, built
 *           from commerce's committed manifest), so a status string is parsed to one of its codes,
 *           never compared as free text.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 16)
 */
import { Schema } from "@stackra/validation";
import type { OrderStatus } from "#stackra/clients/commerce";

/** The orders list filter read from the URL, such as `orders?status=paid`. */
export class OrdersFilter extends Schema {
  /** Only orders in this status; absent lists every status. */
  status?: OrderStatus;
}
