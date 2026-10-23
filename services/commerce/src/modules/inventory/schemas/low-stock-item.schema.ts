/**
 * Stackra file contract:
 * Purpose: `LowStockItem`: one stock level at or under the tenant's threshold.
 * Boundary: a shape class; the element type of ListLowStockOutput, which the low-stock widget's
 *           list display reads (`variantId` primary, `available` secondary). A nested element is a
 *           named class in schemas/.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import type { PublicId } from "@stackra/contracts";
import { Int, Schema } from "@stackra/validation";

/** A variant at one location and how many of its units are still sellable. */
export class LowStockItem extends Schema {
  /** Public id of the catalogue variant. */
  variantId!: PublicId<"var">;

  /** Public id of the warehouse or shop. */
  locationId!: string;

  /** Units still sellable; negative when a count fell below the reservations. */
  @Int
  available!: number;
}
