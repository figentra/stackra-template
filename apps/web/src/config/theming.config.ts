/**
 * Stackra file contract:
 * Purpose: one fact: the look. The one logo source (favicon and the OG template mark derive from
 *          it), schemes, theme colours, and whether a resolved site's brand may override the
 *          defaults.
 * Boundary: tokens themselves are `@stackra/brand`; a tenant site's brand arrives at runtime with
 *           the resolved site and is layered over the defaults by the site frame. This is the one
 *           app where per-tenant brand is real.
 * Runtime: isomorphic
 * Governing contract: ADR 0080 d4, ADR 0234 (asset keys)
 */
import { Config } from "@stackra/config";
import { ColorScheme } from "@stackra/theming";
import { Bool, List, Nested, OneOf, Str } from "@stackra/validation";

/** The `<meta name="theme-color">` pair. */
class ThemeColors {
  /** Light scheme colour. @defaultValue "#f7f7f5" */
  @Str({ pattern: /^#[0-9a-f]{6}$/i }) light = "#f7f7f5";
  /** Dark scheme colour. @defaultValue "#1c1e22" */
  @Str({ pattern: /^#[0-9a-f]{6}$/i }) dark = "#1c1e22";
}

/** Look of the web app: logo source, schemes and the tenant override switch. */
@Config("web.theming")
export class ThemingConfig {
  /** Schemes the visitor may choose between. @defaultValue ColorScheme.values() */
  @List(OneOf(ColorScheme)) schemes = ColorScheme.values();
  /**
   * The scheme of a first visit; `System` follows `prefers-color-scheme`.
   * @defaultValue ColorScheme.System
   */
  @OneOf(ColorScheme) defaultScheme = ColorScheme.System;
  /** The browser chrome colour per scheme. */
  @Nested(ThemeColors) themeColor = new ThemeColors();
  /**
   * Whether a resolved site's brand tokens are layered over the defaults by the site frame.
   * @defaultValue true
   */
  @Bool() tenantOverride = true;
}
