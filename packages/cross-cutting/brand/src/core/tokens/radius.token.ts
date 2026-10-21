/**
 * Stackra file contract:
 * Purpose: the corner radius scale, as `--brand-radius-<name>` in the generated CSS.
 * Boundary: values only, no React; one value per token, the same in light and dark.
 * Runtime: isomorphic
 * Governing contract: ADR 0127 (categories), ADR 0231 (design tokens)
 */

/** Dotted key to a CSS length; `md` is a field, `lg` a panel. */
export const RADIUS_TOKENS = {
  "radius.md": "0.5rem",
  "radius.lg": "0.75rem",
} as const;

/** One of the radius token keys. */
export type RadiusToken = keyof typeof RADIUS_TOKENS;
