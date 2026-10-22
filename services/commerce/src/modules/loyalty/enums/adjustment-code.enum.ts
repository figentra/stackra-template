/**
 * Stackra file contract:
 * Purpose: the adjustment codes loyalty writes onto an order's totals.
 * Boundary: a house enum (class); `value` is the `OrderAdjustment.code`, `label` its i18n key from
 *           the kit's namespace. Singular name : one case is one code; not to be confused with the
 *           `OrderAdjustment` schema that carries it.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (snake_case codes), guides/programming-model.mdx#enums
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** Adjustment codes loyalty writes onto an order's totals. */
export class AdjustmentCode extends Enum<AdjustmentCode> {
  /** Points redeemed against the order; always a negative amount. */
  static readonly LoyaltyPoints = AdjustmentCode.case("loyalty_points", {
    label: I18n.loyalty_kit.adjustment.points,
  });
}
