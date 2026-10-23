/**
 * Stackra file contract:
 * Purpose: the names of the colour design tokens: the public contract of every colour a consumer
 *          or a tenant may name.
 * Boundary: a type only, in the leaf entry, so it imports nothing from the package. The values
 *           are `COLOR_TOKENS` in core, which `satisfies` a record of this union, so a name without
 *           a value, or a value without a name, is a type error.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 8 and 15), ADR 0231 (design tokens: dotted form)
 */

/** One colour token key; its CSS custom property is `--brand-color-<name>`. */
export type ColorToken =
  | "color.accent"
  | "color.accent-foreground"
  | "color.surface"
  | "color.ink"
  | "color.ink-muted"
  | "color.warning";
