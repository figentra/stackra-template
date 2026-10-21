/**
 * Stackra file contract:
 * Purpose: the page folder's barrel: the quick-order page and its one hook.
 * Boundary: explicit exports only.
 * Runtime: browser
 * Governing contract: ADR 0128 d2
 */
export { QuickOrderPage } from "./quick-order";
export { useVariantSearch } from "./use-variant-search";
export type { VariantSearchState } from "./use-variant-search";
