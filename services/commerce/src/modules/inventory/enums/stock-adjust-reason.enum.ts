/**
 * Stackra file contract:
 * Purpose: why an on-hand count changed; kept in the audit record of `inventory.stock.adjust`.
 * Boundary: an `Enum.of` value plus the type of the same name; the code is the wire value
 *           (snake_case), never stored on the row. Labels are the derived i18n keys
 *           `inventory::enums.stock_adjust_reason.<code>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/validation";

/** A required field of the adjust input, so every count change says why. */
export const StockAdjustReason = Enum.of({
  Count: "count",
  Delivery: "delivery",
  Damage: "damage",
});

/** One of the codes above. */
export type StockAdjustReason = Enum.Value<typeof StockAdjustReason>;
