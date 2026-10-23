/**
 * Stackra file contract:
 * Purpose: `VariantSummary`: a variant as ProductView lists it, its public id and SKU.
 * Boundary: a shape class; the element type of `ProductView.variants`. A nested element is a named
 *           class in schemas/.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** Enough of a variant to tell it apart in the console. */
export class VariantSummary extends Schema {
  /** The variant's public id. */
  id!: PublicId<"var">;

  /** The merchant's stock-keeping unit. */
  sku!: string;
}
