/**
 * Stackra file contract:
 * Purpose: who or what ended an order; recorded on `order.cancelled` and decides between the
 *          `cancelled` and `expired` states.
 * Boundary: an `Enum.of` value plus the type of the same name; the code is the event reason code
 *           (snake_case). Labels are the derived i18n keys `orders::enums.cancel_reason.<code>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/validation";

/** OrderStateMachine#expire records `Expired`; #cancel records every other case. */
export const CancelReason = Enum.of({
  Customer: "customer",
  Staff: "staff",
  Expired: "expired",
  PaymentFailed: "payment_failed",
});

/** One of the codes above. */
export type CancelReason = Enum.Value<typeof CancelReason>;
