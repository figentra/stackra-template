/**
 * Stackra file contract:
 * Purpose: the names of the corner radius tokens.
 * Boundary: a type only, in the leaf entry; the values are `RADIUS_TOKENS` in core, which
 *           `satisfies` a record of this union.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 8 and 15), ADR 0231 (design tokens: dotted form)
 */

/** One radius token key; its CSS custom property is `--brand-radius-<name>`. */
export type RadiusToken = "radius.md" | "radius.lg";
