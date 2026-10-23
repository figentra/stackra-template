/**
 * Stackra file contract:
 * Purpose: the adjustment codes loyalty writes onto an order's totals.
 * Boundary: an `Enum.of` value plus the type of the same name; the code is `OrderAdjustment.code`
 *           (snake_case), owned by this module. The enum's own labels are the derived i18n keys
 *           `loyalty::enums.adjustment_code.<code>`; the order line a person reads keeps the kit's
 *           `loyalty_kit::adjustment.points`. Singular name: one case is one code, not to be
 *           confused with the `OrderAdjustment` shape that carries it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/validation";

/** Written by RedeemPointsExtension, found again by HoldPointsExtension. */
export const AdjustmentCode = Enum.of({
  LoyaltyPoints: "loyalty_points",
});

/** One of the codes above. */
export type AdjustmentCode = Enum.Value<typeof AdjustmentCode>;
