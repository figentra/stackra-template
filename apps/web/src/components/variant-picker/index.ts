/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: the component and its Props only; a hook stays private to its folder.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14: component folders, as amended by programming model
 *                     v3.1, AGENTS.md: the barrel re-exports the component and its Props)
 */
export { VariantPicker } from "./variant-picker";
export type { VariantPickerProps } from "./variant-picker.props";
