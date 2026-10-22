/**
 * Stackra file contract:
 * Purpose: why an on-hand count changed; kept in the audit trail of `stock.adjust`.
 * Boundary: a house enum (class); replaces a literal `z.enum([...])` in the input (lint
 *           `stackra/no-string-identity`).
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (snake_case codes), guides/programming-model.mdx#enums
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** Why an on-hand count changed, kept in the audit trail of `stock.adjust`. */
export class StockAdjustReason extends Enum<StockAdjustReason> {
  /** A physical count corrected the number. */
  static readonly Count = StockAdjustReason.case("count", {
    label: I18n.inventory.adjust_reason.count,
  });
  /** A delivery arrived. */
  static readonly Delivery = StockAdjustReason.case("delivery", {
    label: I18n.inventory.adjust_reason.delivery,
  });
  /** Units were written off. */
  static readonly Damage = StockAdjustReason.case("damage", {
    label: I18n.inventory.adjust_reason.damage,
  });
}
