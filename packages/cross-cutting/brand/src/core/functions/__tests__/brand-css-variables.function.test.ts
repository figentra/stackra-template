/**
 * Stackra file contract:
 * Purpose: proves `brandCssVariables` renders declared tokens as one rule and refuses any key or
 *          value that could break out of a declaration, a rule or the `<style>` element it is
 *          inlined into.
 * Boundary: unit tier; the pure function only, no DOM.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0007 (amended: test docblocks)
 */
import { describe, expect, it } from "@stackra/testing";
import { brandCssVariables } from "#core/functions/brand-css-variables.function";
import type { BrandTokens } from "#core/types/brand-tokens.type";

/** Guards the one brand function whose output reaches HTML. */
describe(brandCssVariables, () => {
  /** The shapes a tenant really sends: a colour function, a length and a quoted font stack. */
  it("renders declared tokens as custom properties", () => {
    expect(
      brandCssVariables({
        "color.accent": "oklch(60% 0.2 30)",
        "radius.md": "0.25rem",
        "font.sans": '"Inter", system-ui, sans-serif',
      }),
    ).toBe(
      ":root, .light, .dark { --brand-color-accent: oklch(60% 0.2 30); " +
        "--brand-radius-md: 0.25rem; " +
        '--brand-font-sans: "Inter", system-ui, sans-serif; }',
    );
  });

  /** An empty override is valid and changes nothing. */
  it("renders an empty rule for no overrides", () => {
    expect(brandCssVariables({})).toBe(":root, .light, .dark {  }");
  });

  /** Each value tries a different escape: end the declaration, end the element, load a URL. */
  it.each([
    "red; } body { display: none",
    "</style><script>alert(1)</script>",
    "url(https://evil.example/x.png)",
    '"Inter',
    "oklch(60% 0.2 30",
    "red /* comment */",
  ])("refuses the value %s", (value) => {
    expect(() => brandCssVariables({ "color.accent": value })).toThrow(RangeError);
  });

  /** A key outside the token tables would become an arbitrary custom property name. */
  it("refuses a key the package does not declare", () => {
    const tokens = { "color.accent} body {": "red" } as unknown as Partial<BrandTokens>;
    expect(() => brandCssVariables(tokens)).toThrow(RangeError);
  });
});
