/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/theming's configuration: the look. The one logo
 *          source, schemes and theme colours. Gen rasterises every icon (PWA 192/512/maskable,
 *          .icns, .ico, the tray template) from `logo`, and derives the tray's monochrome mark from
 *          it.
 * Boundary: an override declares `override` members only and inherits the base's key (`theming`);
 *           the theme colours spread the base first. Tokens themselves are `@acme/brand`.
 *           Per-tenant brand at runtime is Pro (brand service), so the console shows the house
 *           brand only; the public site is where a tenant's brand is real.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0080 d4 (light and dark from tokens), ADR 0234
 *                     (asset keys)
 */
import { ColorScheme, ThemingConfig } from "@stackra/theming";
import { Assets } from "#stackra/assets";

/** Look of the console: logo source, schemes and theme colours. */
export class ConsoleThemingConfig extends ThemingConfig {
  /** The one SVG every icon derives from. */
  override logo = Assets.console.public.logo_svg;

  /** Schemes the toggle cycles through, in order. */
  override schemes: ColorScheme[] = [ColorScheme.Light, ColorScheme.Dark, ColorScheme.System];

  /** The scheme of a first visit. */
  override defaultScheme: ColorScheme = ColorScheme.System;

  /** `<meta name="theme-color">` per scheme and the desktop frame colour. */
  override themeColor: ThemingConfig["themeColor"] = {
    ...this.themeColor,
    light: "#f7f7f5",
    dark: "#1c1e22",
  };

  /**
   * Self-host and preload the brand fonts instead of the system families `@acme/brand` names. Off:
   * the brand ships no font files, so there is nothing to host, preload or cache.
   */
  override selfHostedFonts = false;
}
