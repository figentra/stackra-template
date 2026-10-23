/**
 * Stackra file contract:
 * Purpose: `GetVariantByBarcodeInput`: the input of `catalogue.variant.get_by_barcode@1`: the
 *          digits a scanner delivered.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Schema, Str } from "@stackra/validation";

/** The scanned digits. */
export class GetVariantByBarcodeInput extends Schema {
  /** 8 to 14 digits as the scanner delivers them; no check-digit validation here. */
  @Str({ pattern: /^\d{8,14}$/ })
  barcode!: string;
}
