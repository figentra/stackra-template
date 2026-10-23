/**
 * Stackra file contract:
 * Purpose: `AdjustStockOutput`: the output of `inventory.stock.adjust@1`: the level after the
 *          write.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Int, Schema } from "@stackra/validation";

/** The level after the write; `available` already subtracts the current reservations. */
export class AdjustStockOutput extends Schema {
  /** Public id of the catalogue variant. */
  variantId!: PublicId<"var">;

  /** The units on hand now. */
  @Int
  onHand!: number;

  /** On hand minus reserved; negative when the count fell below the reservations. */
  @Int
  available!: number;
}
