/**
 * Stackra file contract:
 * Purpose: axes derive from the variants in order, the first in-stock variant is the start, and an
 *          impossible combination falls back instead of crashing.
 * Boundary: unit tier; the hook alone through renderHook.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { act, renderHook } from "@stackra/testing/react";
import { useVariantChoice } from "#src/hooks/use-variant-choice";

const variants = [
  { id: "v1", sku: "S", priceMinor: 100, inStock: false, options: { Size: "S" } },
  { id: "v2", sku: "M", priceMinor: 120, inStock: true, options: { Size: "M" } },
  { id: "v3", sku: "XL", priceMinor: 140, inStock: true, options: { Size: "XL" } },
];

/** Guards variant selection, which drives the displayed price and stock state. */
describe(useVariantChoice, () => {
  /**
   * Shoppers must land on something buyable, and axis changes must resolve to the matching variant.
   */
  it("starts on the first in-stock variant and switches by axis", () => {
    const { result } = renderHook(() => useVariantChoice(variants));
    expect(result.current.variant.id).toBe("v2");
    expect(result.current.options).toEqual({ Size: ["S", "M", "XL"] });
    act(() => result.current.choose("Size", "XL"));
    expect(result.current.variant.priceMinor).toBe(140);
  });

  /** An impossible option combination must not show a variant that does not exist. */
  it("falls back to the initial variant for a combination that does not exist", () => {
    const { result } = renderHook(() => useVariantChoice(variants));
    act(() => result.current.choose("Size", "XXL"));
    expect(result.current.variant.id).toBe("v2");
  });
});
