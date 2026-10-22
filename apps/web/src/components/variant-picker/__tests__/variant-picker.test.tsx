/**
 * Stackra file contract:
 * Purpose: proves the picker draws one labelled select per option axis, nothing for a
 *          single-variant product, and passes a choice to the shared variant hook.
 * Boundary: unit tier, jsdom; the choice is the real `useVariantChoice` over two variants.
 * Runtime: browser
 * Governing contract: ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { render, renderHook, screen, userEvent } from "@stackra/testing/react";
import { VariantPicker } from "#src/components/variant-picker";
import { useVariantChoice } from "#src/hooks/use-variant-choice";

/** Size M in stock, size L out of stock. */
const VARIANTS = [
  { id: "var_m", sku: "TEE-M", priceMinor: 12_000, inStock: true, options: { size: "M" } },
  { id: "var_l", sku: "TEE-L", priceMinor: 13_000, inStock: false, options: { size: "L" } },
];

/** Guards the control that picks what a shopper buys. */
describe(VariantPicker, () => {
  /** Each axis is a select named after it, and a pick moves the shared choice. */
  it("picks a variant through the labelled axis select", async () => {
    const { result } = renderHook(() => useVariantChoice(VARIANTS));
    render(<VariantPicker choice={result.current} />, { locale: "en" });
    await userEvent.click(screen.getByRole("button", { name: /Option: size/ }));
    await userEvent.click(screen.getByRole("option", { name: "L" }));
    expect(result.current.variant.id).toBe("var_l");
  });

  /** A product with one variant has nothing to choose, so nothing is drawn. */
  it("renders nothing for a single-variant product", () => {
    const single = [{ id: "var_m", sku: "TEE-M", priceMinor: 12_000, inStock: true, options: {} }];
    const { result } = renderHook(() => useVariantChoice(single));
    const { container } = render(<VariantPicker choice={result.current} />, { locale: "en" });
    expect(container).toBeEmptyDOMElement();
  });
});
