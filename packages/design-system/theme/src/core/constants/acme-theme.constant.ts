/**
 * Stackra file contract:
 * Purpose: the acme theme, the example product's brand as a Stackra Design System theme: a blue
 *          accent, warm paper and cool ink, Geist with IBM Plex Sans Arabic, and a 0.5rem radius.
 *          `assets/public/themes/acme/{web,native}.css` are its rendered output, committed so apps
 *          can `@import` them.
 * Boundary: data only, built on the stackra theme: every role, token and step this file does not
 *           name is the stackra theme's. Colours are oklch, the form the CSS uses; each hex is
 *           derived with `oklchToHex`, never typed, so the two cannot disagree. `defineTheme`
 *           validates the whole theme when this module loads.
 * Runtime: isomorphic
 * Governing contract: Stackra ADR 0302 (design system tokens), ADR 0231 (module-level constants
 *                     are SCREAMING_SNAKE)
 */
import { defineTheme, oklchToHex, STACKRA_THEME } from "@stackra/tokens";
import type { ColorToken } from "@stackra/tokens/contracts";

/** One colour in both modes, with its sRGB hex derived from the oklch value. */
const color = (light: string, dark: string): ColorToken => ({
  light,
  dark,
  hexLight: oklchToHex(light),
  hexDark: oklchToHex(dark),
});

/** Cool ink on paper in light, warm paper on ink in dark: every foreground role. */
const INK = color("oklch(0.2 0.01 262)", "oklch(0.96 0.004 95)");

/** Secondary text and placeholders. */
const MUTED = color("oklch(0.55 0.01 262)", "oklch(0.7 0.01 262)");

/** The acme blue: the accent, the focus ring and links. */
const ACCENT = color("oklch(0.55 0.17 262)", "oklch(0.72 0.15 262)");

/**
 * The acme theme. Text pairs meet WCAG AA (4.5:1) in both modes; the test holds them to it. The
 * amber warning is light, so text on it is ink, not white.
 *
 * @example
 * ```css
 * @import "@stackra/tokens/fonts/fonts.css";
 * @import "@acme/theme/themes/acme/web.css";
 * ```
 */
export const ACME_THEME = defineTheme({
  ...STACKRA_THEME,
  name: "acme",
  colors: {
    ...STACKRA_THEME.colors,
    background: color("oklch(0.98 0.004 95)", "oklch(0.18 0.01 262)"),
    foreground: INK,
    "surface-foreground": INK,
    "surface-secondary-foreground": INK,
    "surface-tertiary-foreground": INK,
    "overlay-foreground": INK,
    muted: MUTED,
    "default-foreground": INK,
    accent: ACCENT,
    "accent-foreground": color("oklch(0.99 0 0)", "oklch(0.15 0.01 262)"),
    warning: color("oklch(0.7 0.15 75)", "oklch(0.78 0.14 75)"),
    "warning-foreground": color("oklch(0.2 0.01 262)", "oklch(0.15 0.01 262)"),
    "field-foreground": INK,
    "field-placeholder": MUTED,
    "segment-foreground": INK,
    focus: ACCENT,
    link: ACCENT,
  },
  fontFamily: {
    ...STACKRA_THEME.fontFamily,
    sans: '"Geist", system-ui, sans-serif',
    arabic: '"IBM Plex Sans Arabic", "Geist", system-ui, sans-serif',
  },
  radius: {
    ...STACKRA_THEME.radius,
    base: "0.5rem",
    steps: { ...STACKRA_THEME.radius.steps, lg: "0.75rem" },
  },
});
