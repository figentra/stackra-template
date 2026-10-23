/**
 * Stackra file contract:
 * Purpose: which variant the visitor is looking at: option axes derived from the variants, one
 *          value chosen per axis, and the variant that matches (falls back to the first in-stock
 *          one when a combination does not exist).
 * Boundary: selection logic only; prices and stock are the variants' own fields, never recomputed
 *           here.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 8: shared types in types/; decision 14: a hook with two
 *                     importers lives in hooks/), ADR 0079
 */
import { useMemo, useState } from "react";
import type { Variant } from "#src/types/variant.type";
import type { VariantChoice } from "#src/types/variant-choice.type";

/**
 * Derives the axes once per product; the chosen values start from the first in-stock variant (or
 * the first).
 */
export function useVariantChoice(variants: readonly Variant[]): VariantChoice {
  const options = useMemo(() => {
    const axes: Record<string, string[]> = {};
    for (const variant of variants) {
      for (const [axis, value] of Object.entries(variant.options)) {
        axes[axis] ??= [];
        if (!axes[axis].includes(value)) axes[axis].push(value);
      }
    }
    return axes;
  }, [variants]);

  const initial = variants.find((v) => v.inStock) ?? variants[0];
  const [chosen, setChosen] = useState<Record<string, string>>({ ...initial.options });

  const variant =
    variants.find((v) =>
      Object.entries(chosen).every(([axis, value]) => v.options[axis] === value),
    ) ?? initial;

  return {
    variant,
    options,
    choose: (axis, value) => setChosen((prev) => ({ ...prev, [axis]: value })),
  };
}
