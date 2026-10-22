/**
 * Stackra file contract:
 * Purpose: the set of tokens a tenant's brand may override at runtime, and the token key union.
 * Boundary: types only; a brand is `Partial<BrandTokens>`, because a tenant restates only what
 *           differs from the package defaults. Values are single strings, so a tenant override is
 *           the same in light and dark.
 * Runtime: isomorphic
 * Governing contract: ADR 0127 (categories), ADR 0231 (design tokens)
 */
import type { ColorToken } from "#core/design-tokens/color.design-token";
import type { FontToken } from "#core/design-tokens/font.design-token";
import type { RadiusToken } from "#core/design-tokens/radius.design-token";

/** Any token key. */
export type BrandToken = ColorToken | RadiusToken | FontToken;

/**
 * A full token set; a tenant's brand is a `Partial` of it layered over the defaults at run time.
 */
export type BrandTokens = Record<BrandToken, string>;
