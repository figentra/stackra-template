/**
 * Stackra file contract:
 * Purpose: the brand font stacks, as `--brand-font-<name>` in the generated CSS.
 * Boundary: family names only. The package ships no font files, so there is no URL here: an app
 *           that wants a face on the wire loads it itself and names the same family. Values only,
 *           no React.
 * Runtime: isomorphic
 * Governing contract: ADR 0127 (categories), ADR 0231 (module-level constants are SCREAMING_SNAKE)
 */

/**
 * Dotted key to a CSS `font-family` value: the Latin face, then the Arabic face with the Latin one
 * as fallback.
 */
export const FONT_TOKENS = {
  "font.sans": '"Geist", system-ui, sans-serif',
  "font.arabic": '"IBM Plex Sans Arabic", "Geist", system-ui, sans-serif',
} as const;

/** One of the font token keys. */
export type FontToken = keyof typeof FONT_TOKENS;
