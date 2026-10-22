/**
 * Stackra file contract:
 * Purpose: the params of `OrdersRoute`: an optional status pre-applied when the list opens from a
 *          widget or a deep link.
 * Boundary: a schema class over the producer's enum codec (`Commerce.enums.OrderStatus`, from the
 *           committed manifest), so a status string is parsed to the enum case, never compared as
 *           text.
 * Runtime: isomorphic
 * Governing contract: ADR 0095
 */
import { Schema, z } from "@stackra/schema";
import { Commerce } from "#stackra/clients";

/** The orders list filter read from the URL, such as `orders?status=paid`. */
export class OrdersFilter extends Schema(
  z.object({ status: Commerce.enums.OrderStatus.schema.optional() }),
) {}
