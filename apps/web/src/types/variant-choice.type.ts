/**
 * Stackra file contract:
 * Purpose: what the variant choice hook returns: the matching variant, the option axes and the way
 *          to pick a value on one axis.
 * Boundary: a type shared by `useVariantChoice`, which builds it, and the variant picker, which
 *           renders it; the product page passes it from one to the other.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 8)
 */
import type { Variant } from "#src/types/variant.type";

/** What the picker renders and the page reads. */
export interface VariantChoice {
  /** The variant the current option values resolve to. */
  readonly variant: Variant;
  /** Axis name → values in first-seen order (`{ Size: ["S", "M", "XL"] }`). */
  readonly options: Readonly<Record<string, readonly string[]>>;
  /** Pick a value on one axis; other axes keep their values. */
  readonly choose: (axis: string, value: string) => void;
}
