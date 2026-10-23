/**
 * Stackra file contract:
 * Purpose: the colour design tokens, the one source of every colour: each has a light and a dark
 *          value, and its CSS custom property is `--brand-color-<name>` in the generated
 *          `css/tokens.css` and `css/native.css`.
 * Boundary: values only, no React; `@acme/brand` is cross-cutting (web, native and mail templates
 *           alike). Values are `oklch()` strings, the form the CSS uses, so nothing is converted
 *           between TypeScript and CSS. The names are the `ColorToken` contract, which this table
 *           must cover exactly. Never hand-edit the CSS files: gen rewrites them from this file.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 2 and 15), ADR 0231 (module-level constants are
 *                     SCREAMING_SNAKE; design tokens in dotted and custom-property forms)
 */
import type { ColorToken } from "#contracts/types/color-token.type";

/**
 * Dotted key to its light and dark value; `--brand-<group>-<name>` is the key with `.` turned into
 * `-`.
 */
export const COLOR_TOKENS = {
  "color.accent": { light: "oklch(55% 0.17 262)", dark: "oklch(72% 0.15 262)" },
  "color.accent-foreground": { light: "oklch(99% 0 0)", dark: "oklch(15% 0.01 262)" },
  "color.surface": { light: "oklch(98% 0.004 95)", dark: "oklch(18% 0.01 262)" },
  "color.ink": { light: "oklch(20% 0.01 262)", dark: "oklch(96% 0.004 95)" },
  "color.ink-muted": { light: "oklch(55% 0.01 262)", dark: "oklch(70% 0.01 262)" },
  "color.warning": { light: "oklch(70% 0.15 75)", dark: "oklch(78% 0.14 75)" },
} as const satisfies Record<ColorToken, { readonly light: string; readonly dark: string }>;
