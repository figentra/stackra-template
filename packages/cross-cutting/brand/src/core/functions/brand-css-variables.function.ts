/**
 * Stackra file contract:
 * Purpose: renders a tenant's brand tokens as one CSS rule, so a server can inline `<style>` after
 *          the stylesheet.
 * Boundary: a pure string function with no React and no I/O; it escapes nothing, so its input is
 *           the typed `Partial<BrandTokens>` a validated site config produced, never a raw request
 *           value. The rule applies in light and dark, because a tenant override has one value.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (design tokens), ADR 0127 (categories)
 */
import { brandVariableName } from "#core/functions/brand-variable-name.function";
import type { BrandToken, BrandTokens } from "#core/types/brand-tokens.type";

/**
 * Renders a tenant's brand overrides as one CSS rule.
 * @param tokens - the tokens a tenant overrides; an empty object renders an empty rule.
 * @returns `:root, .light, .dark { --brand-…: …; }`.
 * @example
 * brandCssVariables({ "color.accent": "oklch(60% 0.2 30)" });
 */
export function brandCssVariables(tokens: Partial<BrandTokens>): string {
  const declarations = (Object.entries(tokens) as [BrandToken, string][])
    .map(([token, value]) => `${brandVariableName(token)}: ${value};`)
    .join(" ");
  return `:root, .light, .dark { ${declarations} }`;
}
