/**
 * Stackra file contract:
 * Purpose: a full set of brand token values; a tenant's brand is a `Partial` of it.
 * Boundary: a type only, in the leaf entry. Values are single strings, so a tenant override is the
 *           same in light and dark; a tenant restates only what differs from the package defaults.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 8 and 15), ADR 0231 (design tokens)
 */
import type { BrandToken } from "#contracts/types/brand-token.type";

/** Every token key to one value; a tenant's `Partial<BrandTokens>` layers over the defaults. */
export type BrandTokens = Record<BrandToken, string>;
