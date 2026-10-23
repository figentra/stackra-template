/**
 * Stackra file contract:
 * Purpose: `VariantHit`: one sellable variant with enough of its product for a POS line.
 * Boundary: a shape class in schemas/ because the barcode lookup returns it and the variant search
 *           lists it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** What the mobile POS adds to a sale. */
export class VariantHit extends Schema {
  /** The variant's public id. */
  variantId!: PublicId<"var">;

  /** Its product's public id. */
  productId!: PublicId<"prd">;

  /** The merchant's stock-keeping unit. */
  sku!: string;

  /** The product title in the request locale. */
  title!: string;

  /** Whether inventory tracks stock for the variant. */
  trackInventory!: boolean;
}
