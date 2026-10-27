/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/theming's configuration: the look. The theme (`acme`,
 *          built with `defineTheme` in `@acme/theme`), the one logo source, the schemes and the
 *          fonts. Gen rasterises every icon (PWA 192/512, maskable, monochrome, .icns, .ico, the
 *          tray template) from `logo`, and takes `theme-color` and the manifest's background and
 *          theme colours per scheme from the theme's `background` token.
 * Boundary: an override keeps the base's name and imports the base as `BaseThemingConfig`; it sets
 *           `override` field defaults only and inherits the base's key (`theming`). A second
 *           override of the same base fails gen. Defaults are gen constants: the logo is its asset
 *           key and `ColorScheme` is a string union, so both are literals. Colours are tokens, never literals here: the
 *           stylesheet imports `@acme/theme/themes/acme/web.css` and the faces from
 *           `@stackra/tokens/fonts/fonts.css`. Per-tenant brand at runtime is Pro (brand service),
 *           so the console shows the house theme only.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0302 (design system), ADR 0080 d4 (light and dark from
 *                     tokens), ADR 0234 (asset keys)
 */
import { type ColorScheme, ThemingConfig as BaseThemingConfig } from "@stackra/theming";

/** Look of the console: theme, logo source, schemes and fonts. */
export class ThemingConfig extends BaseThemingConfig {
  /** The theme `@acme/theme` builds; its web CSS is the stylesheet's, its tokens gen's. */
  override theme = "acme";

  /** The one SVG every icon derives from. */
  override logo = "console::public/logo.svg";

  /** Schemes the toggle cycles through, in order. */
  override schemes: ColorScheme[] = ["light", "dark", "system"];

  /** The scheme of a first visit. */
  override defaultScheme: ColorScheme = "system";

  /**
   * Self-host and preload the theme's faces (Geist, IBM Plex Sans Arabic) from
   * `@stackra/tokens/fonts/`, so the first paint uses them offline too; the worker precaches the
   * files with the shell.
   */
  override selfHostedFonts = true;
}
