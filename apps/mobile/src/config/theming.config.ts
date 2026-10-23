/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/theming's configuration: the look. The `acme` theme, the
 *          one logo source (the app's own mark, `assets/public/logo.svg`), the colour schemes, the
 *          theme and splash colours. Gen rasterises every icon (app icon, adaptive icon,
 *          notification icon, splash) from `logo`.
 * Boundary: an override declares `override` members only and inherits the base's key (`theming`);
 *           its presence mounts the theme context and the UI kit with its toast region, so the app
 *           writes no theme provider. The tokens themselves are the `acme` theme of `@acme/theme`
 *           (built with `defineTheme` from `@stackra/tokens`; its `native.css` is the Uniwind theme
 *           of the UI kit, imported by `styles/global.css`). App icons are the app's: no package
 *           ships a mark this app renders. Glass headers and the tab bar are native chrome
 *           (`chrome.config.ts`). Per-tenant brand at runtime is Pro on mobile (ADR 0180 decision
 *           1): white-label builds arrive through an EAS variant in runway.yaml, so this app shows
 *           only the scheme switch. The splash colours are the only literals because the native
 *           splash cannot read CSS. Fields typed by an enum restate their type; nested objects
 *           merge the base value explicitly.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md: Base
 *                     alias), ADR 0295 (decisions 4 and 10), ADR 0056, ADR 0080, ADR 0180, ADR 0234
 */
import { ColorScheme, ThemingConfig as BaseThemingConfig } from "@stackra/theming";

/** The `acme` theme's light and dark schemes, following the system until the user picks one. */
export class ThemingConfig extends BaseThemingConfig {
  /** The theme by name, from `@acme/theme` (one token set per scheme). */
  override theme = "acme";

  /** Asset key of the one SVG every icon derives from. */
  override logo = "mobile::public/logo.svg";

  /** The schemes the settings page offers. */
  override schemes: ColorScheme[] = [ColorScheme.Light, ColorScheme.Dark, ColorScheme.System];

  /** The scheme of a first launch. */
  override defaultScheme: ColorScheme = ColorScheme.System;

  /** The Android status bar and the adaptive icon background, per scheme. */
  override themeColor = { light: "#f7f7f5", dark: "#1c1e22" };

  /** The native splash background per scheme; the image is derived from `logo`. */
  override splash = { ...this.splash, background: { light: "#f7f7f5", dark: "#1c1e22" } };

  /** Platform fonts, which cover Arabic script natively, until the theme ships font files. */
  override selfHostedFonts = false;
}
