/**
 * Stackra file contract:
 * Purpose: the refusal when an order is placed while the tenant has paused ordering; raised by
 *          AcceptingOrdersPrecondition.
 * Boundary: a refusal class: kind `FailedPrecondition` reports under the `precondition_failed`
 *           category, the code is derived from the class name (`orders_paused`), and the clients
 *           show the text `orders::refusals.orders_paused`. It carries no details.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (as amended: the precondition
 *                     category), ADR 0232
 */
import { ErrorKind, Refusal } from "@stackra/errors";

/** Not retryable until a tenant admin switches ordering back on. */
export class OrdersPausedError extends Refusal({
  kind: ErrorKind.FailedPrecondition,
  retryable: false,
}) {}
