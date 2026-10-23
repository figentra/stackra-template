/**
 * Stackra file contract:
 * Purpose: the corner radius scale, as `--brand-radius-<name>` in the generated CSS.
 * Boundary: values only, no React; one value per token, the same in light and dark. The names are
 *           the `RadiusToken` contract, which this table must cover exactly.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 2 and 15), ADR 0231 (design tokens)
 */
import type { RadiusToken } from "#contracts/types/radius-token.type";

/** Dotted key to a CSS length; `md` is a field, `lg` a panel. */
export const RADIUS_TOKENS = {
  "radius.md": "0.5rem",
  "radius.lg": "0.75rem",
} as const satisfies Record<RadiusToken, string>;
