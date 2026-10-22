/**
 * Stackra file contract:
 * Purpose: one fact: the look. The brand token set, the one logo source, the colour schemes, the
 *          theme and splash colours, Liquid Glass. Gen rasterises every icon (app icon, adaptive
 *          icon, notification icon, splash) from `logo`.
 * Boundary: the tokens themselves are `@acme/brand` (`css/native.css` maps them onto the UI
 *           kit's variables). Per-tenant brand at runtime is Pro on mobile (ADR 0180 d1):
 *           white-label builds arrive through an EAS variant in `runway.yaml`, so this app shows
 *           only the scheme switch. The splash colours are the only literals because the native
 *           splash cannot read CSS; `splash.resizeMode` is Expo's own value.
 * Runtime: isomorphic
 * Governing contract: ADR 0056, ADR 0080, ADR 0180, ADR 0234
 */
import { Config } from "@stackra/config";
import { ColorScheme } from "@stackra/theming";
import { Bool, List, Nested, OneOf, Str } from "@stackra/validation";

/** A light/dark colour pair. */
class ThemeColors {
  /** The light-scheme colour. */
  @Str({ pattern: /^#[0-9a-f]{6}$/i }) light = "#f7f7f5";
  /** The dark-scheme colour. */
  @Str({ pattern: /^#[0-9a-f]{6}$/i }) dark = "#1c1e22";
}

/** The native splash: background per scheme; the image is derived from `logo`. */
class SplashConfig {
  /** Background per scheme. */
  @Nested(ThemeColors) background = new ThemeColors();
  /** Tool-owned: Expo's splash `resizeMode`. @defaultValue "contain" */
  @OneOf(["contain", "cover"]) resizeMode = "contain";
}

/**
 * `logo` is an asset key of this app; `schemes` drives `userInterfaceStyle` and the theme context.
 */
@Config("mobile.theming")
export class ThemingConfig {
  /** The token package (one set per scheme). */
  @Str() brand = "@acme/brand";
  /** Asset key of the one SVG every icon derives from. */
  @Str({ pattern: /^mobile::public\// }) logo = "mobile::public/logo.svg";
  /**
   * Optional monochrome variant for the Android notification icon; derived from `logo` when absent.
   */
  @Str() monochromeLogo?: string;
  /** The schemes the settings page offers. */
  @List(OneOf(ColorScheme)) schemes = [ColorScheme.Light, ColorScheme.Dark, ColorScheme.System];
  /** The scheme of a first launch. @defaultValue ColorScheme.System */
  @OneOf(ColorScheme) defaultScheme = ColorScheme.System;
  /** The Android status bar and the adaptive icon background. */
  @Nested(ThemeColors) themeColor = new ThemeColors();
  /** The native splash. */
  @Nested(SplashConfig) splash = new SplashConfig();
  /**
   * iOS 26 glass headers and tab bar; off renders the plain surface everywhere. @defaultValue true
   */
  @Bool() liquidGlass = true;
  /**
   * Ship the brand fonts in the binary; off uses the platform fonts, which cover Arabic script
   * natively. Off until the brand package ships font files. @defaultValue false
   */
  @Bool() selfHostedFonts = false;
}
