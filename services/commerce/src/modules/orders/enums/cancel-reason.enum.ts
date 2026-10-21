/**
 * Stackra file contract:
 * Purpose: who or what ended an order; recorded on `order.cancelled` and decides between
 *          `cancelled` and `expired`.
 * Boundary: a house enum (class); the `value` is the event reason code (snake_case, ADR 0231).
 * Runtime: isomorphic
 * Governing contract: ADR 0128 (amended), ADR 0231, guides/programming-model.mdx#enums
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/**
 * The End transition (states/order.state.ts) maps `Expired` to the expired state and everything
 * else to cancelled.
 */
export class CancelReason extends Enum<CancelReason> {
  /** The customer cancelled their own unpaid order. */
  static readonly Customer = CancelReason.case("customer", {
    label: I18n.orders.cancel_reason.customer,
  });
  /** Staff cancelled it from the console. */
  static readonly Staff = CancelReason.case("staff", { label: I18n.orders.cancel_reason.staff });
  /** The expiry job ended it after the tenant's window. */
  static readonly Expired = CancelReason.case("expired", {
    label: I18n.orders.cancel_reason.expired,
  });
  /** The create-order workflow compensated after a refused payment. */
  static readonly PaymentFailed = CancelReason.case("payment_failed", {
    label: I18n.orders.cancel_reason.payment_failed,
  });
}
