/**
 * Stackra file contract:
 * Purpose: `GetVariantByBarcodeInput`: the scanned digits of `catalogue.variant.get_by_barcode`.
 * Boundary: one schema class and its inferred type (ADR 0006); 8 to 14 digits as the scanner
 *           delivers them, no check-digit validation here.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas, ADR 0231
 */
import { Schema, z } from "@stackra/schema";

/** The scanned digits, as the scanner delivers them. */
export class GetVariantByBarcodeInput extends Schema(
  z.object({ barcode: z.string().regex(/^\d{8,14}$/) }),
) {}
