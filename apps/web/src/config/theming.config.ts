/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/theming's configuration: the look. The theme by name
 *          (`acme`, from `@acme/theme`), the one logo source (favicon and the OG template mark
 *          derive from it), schemes, theme colours, and whether a resolved site's colours may
 *          override the theme's.
 * Boundary: an override declares `override` members only and inherits the base's key (`theming`).
 *           Its defaults are gen constants: the logo is its asset key, `ColorScheme` is a string
 *           union, and the theme colours are the sRGB hex of `ACME_THEME`'s background token (the
 *           mobile app's splash values), because `ACME_THEME` is computed by `defineTheme` and gen
 *           cannot evaluate it. The tokens themselves are `@acme/theme` (a `defineTheme` theme of
 *           `@stackra/tokens`, rendered to `@acme/theme/themes/acme/web.css`); a tenant site's
 *           colours arrive at runtime with the resolved site and are layered over the theme by the
 *           site frame. This is the one app where per-tenant colours are real.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 26; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0302 (design system tokens), ADR 0080 d4, ADR 0234 (asset
 *                     keys)
 */
import { type ColorScheme, ThemingConfig as BaseThemingConfig } from "@stackra/theming";

/** Look of the site: theme, logo source, schemes, theme colours and the tenant override switch. */
export class ThemingConfig extends BaseThemingConfig {
  /** The theme the stylesheet imports; `acme` is `@acme/theme/themes/acme/web.css`. */
  override theme = "acme";

  /** The one SVG the favicon and the OG mark derive from. */
  override logo = "web::public/logo.svg";

  /** Schemes the visitor may choose between. */
  override schemes: ColorScheme[] = ["light", "dark", "system"];

  /** The scheme of a first visit; `system` follows `prefers-color-scheme`. */
  override defaultScheme: ColorScheme = "system";

  /** `<meta name="theme-color">` per scheme: the acme background token. */
  override themeColor = { light: "#f7f7f5", dark: "#1c1e22" };

  /** Whether a resolved site's colours are layered over the theme's by the site frame. */
  override scopeOverride = true;
}
