/**
 * Stackra file contract:
 * Purpose: the CSS custom property name of a token: `color.accent` becomes `--brand-color-accent`.
 * Boundary: a pure function; the one place the naming rule lives, used by the generated CSS and by
 *           `brandCssVariables`, so a consumer that references only `--brand-<group>-<name>` always
 *           finds the name.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (design tokens: dotted form and CSS custom property form)
 */
import type { BrandToken } from "#core/types/brand-tokens.type";

/**
 * Names the CSS custom property of a token.
 * @returns the custom property name, `--brand-<group>-<name>`.
 */
export function brandVariableName(token: BrandToken): string {
  return `--brand-${token.replace(".", "-")}`;
}
