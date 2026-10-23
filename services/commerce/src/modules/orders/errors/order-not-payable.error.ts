/**
 * Stackra file contract:
 * Purpose: the refusal when a capture arrives for an order that cannot take it (terminal, or paid
 *          by another payment).
 * Boundary: a refusal class: the kind gives the category (`conflict`, so HTTP 409 through the
 *           generated adapter), the code is derived from the class name (`order_not_payable`) and
 *           the fields are the envelope's details. Built with `OrderNotPayableError.create`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0232
 */
import type { PublicId } from "@stackra/contracts";
import { ErrorKind, Refusal } from "@stackra/errors";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";

/** Not retryable: waiting never changes the state of an order that is already terminal or paid. */
export class OrderNotPayableError extends Refusal({
  kind: ErrorKind.Conflict,
  retryable: false,
}) {
  /** The order the capture named. */
  orderId!: PublicId<"ord">;

  /** The state the order was in when the capture arrived. */
  status!: OrderStatus;
}
