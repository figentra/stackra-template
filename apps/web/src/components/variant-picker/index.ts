/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: explicit exports only.
 * Runtime: browser
 * Governing contract: ADR 0128 (component folders)
 */
export { VariantPicker } from "./variant-picker";
export type { VariantPickerProps } from "./variant-picker";
export { useVariantChoice } from "#src/hooks/use-variant-choice";
export type { VariantChoice, Variant } from "#src/hooks/use-variant-choice";
