/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: explicit exports only; the hook stays private to the folder.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14: component folders)
 */
export { LocaleSuggestion } from "./locale-suggestion";
export type { LocaleSuggestionProps } from "./locale-suggestion";
