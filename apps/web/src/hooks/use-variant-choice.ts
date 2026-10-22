/**
 * Stackra file contract:
 * Purpose: which variant the visitor is looking at: option axes derived from the variants, one
 *          value chosen per axis, and the variant that matches (falls back to the first in-stock
 *          one when a combination does not exist).
 * Boundary: selection logic only; prices and stock are the variants' own fields, never recomputed
 *           here.
 * Runtime: browser
 * Governing contract: ADR 0128 (a hook shared by two folders lives in hooks/), ADR 0079
 */
import { useMemo, useState } from "react";
import type { z } from "@stackra/schema";
import type { StorefrontProductView } from "#stackra/clients";

/** One of the product's variants. */
export type Variant = z.infer<typeof StorefrontProductView>["variants"][number];

/** What the picker renders and the page reads. */
export interface VariantChoice {
  /** The variant the current option values resolve to. */
  readonly variant: Variant;
  /** Axis name → values in first-seen order (`{ Size: ["S", "M", "XL"] }`). */
  readonly options: Readonly<Record<string, readonly string[]>>;
  /** Pick a value on one axis; other axes keep their values. */
  readonly choose: (axis: string, value: string) => void;
}

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
