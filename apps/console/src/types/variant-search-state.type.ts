/**
 * Stackra file contract:
 * Purpose: `VariantSearchState`: what `useVariantSearch` returns to the variant pickers of the
 *          quick-order page and the attach-images form.
 * Boundary: a type only, in the app's `types/` group; hits are the commerce service's generated
 *           view type.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file)
 */
import type { VariantHit } from "#stackra/clients/commerce";

/** The hits for a combo box and whether a search is in flight. */
export interface VariantSearchState {
  /** Hits for the combo box; empty before the first search. */
  readonly items: readonly VariantHit[];
  /** True while a search is in flight. */
  readonly isLoading: boolean;
}
