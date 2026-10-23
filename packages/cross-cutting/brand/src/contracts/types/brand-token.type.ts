/**
 * Stackra file contract:
 * Purpose: any design token key a tenant's brand may override at run time.
 * Boundary: a type only, in the leaf entry: the union of the three token families.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 8 and 15), ADR 0231 (design tokens)
 */
import type { ColorToken } from "#contracts/types/color-token.type";
import type { FontToken } from "#contracts/types/font-token.type";
import type { RadiusToken } from "#contracts/types/radius-token.type";

/** Any token key, of any family. */
export type BrandToken = ColorToken | RadiusToken | FontToken;
