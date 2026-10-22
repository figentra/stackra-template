/**
 * Stackra file contract:
 * Purpose: one fact: the look. The one logo source, schemes and theme colours. Gen rasterises every
 *          icon (PWA 192/512/maskable, .icns, .ico, the tray template) from `logo`.
 * Boundary: tokens themselves are `@acme/brand`. Per-tenant brand at runtime is Pro (brand
 *           service), so the console shows the house brand only; the public site is where a
 *           tenant's brand is real.
 * Runtime: isomorphic
 * Governing contract: ADR 0080 d4 (light and dark from tokens), ADR 0234 (asset keys)
 */
import { Config } from "@stackra/config";
import { ColorScheme } from "@stackra/theming";
import { Bool, List, Nested, OneOf, Str } from "@stackra/validation";
import { Assets } from "#stackra/assets";

/** The `<meta name="theme-color">` pair and the desktop frame colour. */
class ThemeColors {
  /** Light scheme colour. @defaultValue "#f7f7f5" */
  @Str({ pattern: /^#[0-9a-f]{6}$/i }) light = "#f7f7f5";
  /** Dark scheme colour. @defaultValue "#1c1e22" */
  @Str({ pattern: /^#[0-9a-f]{6}$/i }) dark = "#1c1e22";
}

/** Look of the console: logo source, schemes and theme colours. */
@Config("console.theming")
export class ThemingConfig {
  /** The one SVG every icon derives from. @defaultValue Assets.console.public.logo_svg */
  logo = Assets.console.public.logo_svg;
  /** Monochrome variant for the tray; derived from `logo` when absent. */
  monochromeLogo?: typeof Assets.console.public.logo_svg;
  /** Schemes the toggle cycles through, in order. @defaultValue ColorScheme.values() */
  @List(OneOf(ColorScheme)) schemes = ColorScheme.values();
  /** The scheme of a first visit. @defaultValue ColorScheme.System */
  @OneOf(ColorScheme) defaultScheme = ColorScheme.System;
  /** `<meta name="theme-color">` and the desktop frame. */
  @Nested(ThemeColors) themeColor = new ThemeColors();
  /**
   * Self-host and preload the brand fonts instead of the system families `@acme/brand` names.
   * Off: the brand ships no font files, so there is nothing to host, preload or cache.
   * @defaultValue false
   */
  @Bool() selfHostedFonts = false;
}
