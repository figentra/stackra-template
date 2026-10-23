/**
 * Stackra file contract:
 * Purpose: `StockLine`: what a caller wants held or released: a variant and a unit count, at the
 *          tenant's default location.
 * Boundary: a type only, the parameter element of StockService#reserve and #release. Callers pass
 *           any value of this shape (orders passes its priced draft lines), so they never import
 *           it; a shape class would be needed only if it crossed the wire.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 8 and 13)
 */
import type { PublicId } from "@stackra/contracts";

/** One variant and how many of its units to reserve or release. */
export interface StockLine {
  /** Public id of the catalogue variant. */
  readonly variantId: PublicId<"var">;

  /** Units to reserve or release; positive. */
  readonly quantity: number;
}
