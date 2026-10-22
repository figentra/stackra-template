/**
 * Stackra file contract:
 * Purpose: the brand package's root entry: the token tables and the function that renders a
 *          tenant's overrides.
 * Boundary: named re-exports only (no `export *`, ADR 0006); no React.
 * Runtime: isomorphic
 * Governing contract: ADR 0006, ADR 0126 decision 2
 */
export { COLOR_TOKENS, type ColorToken } from "#core/design-tokens/color.design-token";
export { RADIUS_TOKENS, type RadiusToken } from "#core/design-tokens/radius.design-token";
export { FONT_TOKENS, type FontToken } from "#core/design-tokens/font.design-token";
export type { BrandToken, BrandTokens } from "#core/types/brand-tokens.type";
export { brandCssVariables } from "#core/functions/brand-css-variables.function";
export { brandVariableName } from "#core/functions/brand-variable-name.function";
