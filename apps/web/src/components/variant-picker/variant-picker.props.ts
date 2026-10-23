/**
 * Stackra file contract:
 * Purpose: the Props of `VariantPicker`: the variant choice the product page holds.
 * Boundary: a type only; the choice is `useVariantChoice`'s result.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { VariantChoice } from "#src/types/variant-choice.type";

/** The hook's result, passed down so the page and the picker agree on the variant. */
export interface VariantPickerProps {
  /** The choice the product page holds, so the page and the picker agree on the variant. */
  readonly choice: VariantChoice;
}
