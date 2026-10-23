/**
 * Stackra file contract:
 * Purpose: the order lifecycle codes; `cancelled` and `expired` are terminal.
 * Boundary: an `Enum.of` value plus the type of the same name. The code is the wire and column
 *           value; the tone is what the console colours the status with. Labels are the derived
 *           i18n keys `orders::enums.order_status.<code>`; transitions live in
 *           models/order.state-machine.ts.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0161, ADR 0231 (snake_case codes)
 */
import { Enum, Tone } from "@stackra/contracts";

/**
 * One case per status; cases are plain codes, so they compare with `===`.
 *
 * @example
 * OrderStatus.PendingPayment;          // "pending_payment"
 * Enum.values(OrderStatus);            // ["pending_payment", "paid", "cancelled", "expired"]
 * Enum.meta(OrderStatus, "paid").tone; // Tone.Success
 */
export const OrderStatus = Enum.of({
  PendingPayment: ["pending_payment", { tone: Tone.Warning }],
  Paid: ["paid", { tone: Tone.Success }],
  Cancelled: ["cancelled", { tone: Tone.Default }],
  Expired: ["expired", { tone: Tone.Default }],
});

/** One of the codes above. */
export type OrderStatus = Enum.Value<typeof OrderStatus>;
