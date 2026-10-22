/**
 * Stackra file contract:
 * Purpose: the order lifecycle codes; `cancelled` and `expired` are terminal.
 * Boundary: a house enum (a class): one case per static member; `value` is
 *           the wire and column value, `label` an i18n key, `meta` what the console needs.
 *           Transitions live in states/order.state.ts.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (snake_case codes), guides/programming-model.mdx#enums
 */
import { Tone } from "@stackra/contracts";
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/**
 * One case per status. `OrderStatus.from("paid")` returns the singleton `OrderStatus.Paid`, so
 * cases compare by
 * identity. `OrderStatus.schema` is a Zod codec: wire string ↔ case; `OrderStatus.codes` the
 * literal union.
 *
 * @example
 * OrderStatus.values();        // [PendingPayment, Paid, Cancelled, Expired]
 * OrderStatus.tryFrom("nope"); // undefined
 * OrderStatus.Paid.label;      // "orders::status.paid"
 */
export class OrderStatus extends Enum<OrderStatus> {
  /** Placed, stock reserved, payment not yet captured. */
  static readonly PendingPayment = OrderStatus.case("pending_payment", {
    label: I18n.orders.status.pending_payment,
    color: Tone.Warning,
  });
  /** Payment captured; the order is final. */
  static readonly Paid = OrderStatus.case("paid", {
    label: I18n.orders.status.paid,
    color: Tone.Success,
  });
  /** Ended by a customer, staff or a failed payment; terminal. */
  static readonly Cancelled = OrderStatus.case("cancelled", {
    label: I18n.orders.status.cancelled,
    color: Tone.Default,
  });
  /** Ended by the expiry job; terminal. */
  static readonly Expired = OrderStatus.case("expired", {
    label: I18n.orders.status.expired,
    color: Tone.Default,
  });
}
