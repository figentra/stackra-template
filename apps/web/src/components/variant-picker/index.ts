/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: the component and its Props only; a hook stays private to its folder.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14: component folders)
 */
export { VariantPicker } from "./variant-picker";
export type { VariantPickerProps } from "./variant-picker";
