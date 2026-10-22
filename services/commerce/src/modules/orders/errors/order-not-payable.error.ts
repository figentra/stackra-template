/**
 * Stackra file contract:
 * Purpose: the refusal when a capture arrives for an order that cannot take it (terminal, or paid
 *          by another payment).
 * Boundary: a typed AppError: one category, one snake_case code, ids in `details`; the HTTP status
 *           (409) is derived from the category by the generated adapter and never written here.
 * Runtime: isomorphic
 * Governing contract: ADR 0140 (envelope), ADR 0232 (every error extends the base error, renamed
 *                     AppError), guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";

/**
 * `conflict` / `order_not_payable`; not retryable because waiting never changes the order's state.
 */
export class OrderNotPayableError extends AppError {
  constructor(orderId: string, status: OrderStatus) {
    super({
      category: ErrorCategory.Conflict,
      code: "order_not_payable",
      retryable: false,
      details: { orderId, status: status.value },
    });
  }
}
