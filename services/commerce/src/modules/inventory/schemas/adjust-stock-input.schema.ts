/**
 * Stackra file contract:
 * Purpose: `AdjustStockInput`: the input of `inventory.stock.adjust@1`: the absolute on-hand count
 *          for one variant at one location, with why it changed.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Int, Schema } from "@stackra/validation";
import type { StockAdjustReason } from "#modules/inventory/enums/stock-adjust-reason.enum";

/** The absolute on-hand count for one variant at one location, with why it changed. */
export class AdjustStockInput extends Schema {
  /** Public id of the catalogue variant, from the path. */
  variantId!: PublicId<"var">;

  /** Public id of the warehouse or shop, from the path. */
  locationId!: string;

  /** The units counted on hand. */
  @Int({ min: 0 })
  onHand!: number;

  /** Why the count changed. */
  reason!: StockAdjustReason;
}
