/**
 * Stackra file contract:
 * Purpose: the phases of the barcode scanner: unavailable, asking for permission, scanning,
 *          looking up a code, found and not found.
 * Boundary: a type only, a union told apart by `kind`; `useScan` moves between the phases and the
 *           `Scan` page renders one view per phase. `found` hands the variant to the page.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: one
 *                     declaration per file), ADR 0250, ADR 0253
 */
import type { PublicId } from "@stackra/contracts";

/** One phase of the scanner. */
export type ScanPhase =
  | { readonly kind: "unavailable" }
  | { readonly kind: "permission"; readonly request: () => Promise<void> }
  | { readonly kind: "scanning" }
  | { readonly kind: "looking_up"; readonly barcode: string }
  | { readonly kind: "found"; readonly variantId: PublicId<"var">; readonly title: string }
  | { readonly kind: "not_found"; readonly barcode: string; readonly reset: () => void };
