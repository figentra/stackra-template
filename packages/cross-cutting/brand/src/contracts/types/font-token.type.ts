/**
 * Stackra file contract:
 * Purpose: the names of the brand font stacks.
 * Boundary: a type only, in the leaf entry; the values are `FONT_TOKENS` in core, which
 *           `satisfies` a record of this union.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 8 and 15), ADR 0231 (design tokens: dotted form)
 */

/** One font token key; its CSS custom property is `--brand-font-<name>`. */
export type FontToken = "font.sans" | "font.arabic";
