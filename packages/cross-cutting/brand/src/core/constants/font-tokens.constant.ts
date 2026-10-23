/**
 * Stackra file contract:
 * Purpose: the brand font stacks, as `--brand-font-<name>` in the generated CSS.
 * Boundary: family names only. The package ships no font files, so there is no URL here: an app
 *           that wants a face on the wire loads it itself and names the same family. Values only,
 *           no React. The names are the `FontToken` contract, which this table must cover exactly.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 2 and 15), ADR 0231 (module-level constants are
 *                     SCREAMING_SNAKE)
 */
import type { FontToken } from "#contracts/types/font-token.type";

/**
 * Dotted key to a CSS `font-family` value: the Latin face, then the Arabic face with the Latin one
 * as fallback.
 */
export const FONT_TOKENS = {
  "font.sans": '"Geist", system-ui, sans-serif',
  "font.arabic": '"IBM Plex Sans Arabic", "Geist", system-ui, sans-serif',
} as const satisfies Record<FontToken, string>;
