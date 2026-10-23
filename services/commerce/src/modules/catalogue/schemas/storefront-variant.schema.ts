/**
 * Stackra file contract:
 * Purpose: `StorefrontVariant`: a sellable variant with its price now, its option values
 *          (`{ size: "M" }`) and whether stock covers one unit.
 * Boundary: a shape class; the element type of `StorefrontProductView.variants`. The price is
 *           integer minor units in the page's currency (ADR 0220).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26), ADR 0220 (integer minor units)
 */
import type { PublicId } from "@stackra/contracts";
import { Int, Schema } from "@stackra/validation";

/** One choice in the storefront's variant picker. */
export class StorefrontVariant extends Schema {
  /** The variant's public id. */
  id!: PublicId<"var">;

  /** The merchant's stock-keeping unit. */
  sku!: string;

  /** Price of one unit for the request's market, in minor units. */
  @Int
  priceMinor!: number;

  /** Whether one unit can be sold now; always true for a variant that tracks no stock. */
  inStock!: boolean;

  /** The option values the picker shows. */
  options!: Record<string, string>;
}
