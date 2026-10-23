/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/theming's configuration: the look. The theme by name
 *          (`acme`, from `@acme/theme`), the one logo source (favicon and the OG template mark
 *          derive from it), schemes, theme colours, and whether a resolved site's colours may
 *          override the theme's.
 * Boundary: an override declares `override` members only and inherits the base's key (`theming`);
 *           the theme colours spread the base first and read the theme's background token, never a
 *           literal. The tokens themselves are `@acme/theme` (a `defineTheme` theme of
 *           `@stackra/tokens`, rendered to `@acme/theme/themes/acme/web.css`); a tenant site's
 *           colours arrive at runtime with the resolved site and are layered over the theme by the
 *           site frame. This is the one app where per-tenant colours are real.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: the Base alias),
 *                     ADR 0302 (design system tokens), ADR 0080 d4, ADR 0234 (asset keys)
 */
import { ACME_THEME } from "@acme/theme";
import { ColorScheme, ThemingConfig as BaseThemingConfig } from "@stackra/theming";
import { Enum } from "@stackra/contracts";
import { Assets } from "#stackra/assets";

/** Look of the site: theme, logo source, schemes, theme colours and the tenant override switch. */
export class ThemingConfig extends BaseThemingConfig {
  /** The theme the stylesheet imports; `acme` is `@acme/theme/themes/acme/web.css`. */
  override theme = "acme";

  /** The one SVG the favicon and the OG mark derive from. */
  override logo = Assets.web.public.logo_svg;

  /** Schemes the visitor may choose between. */
  override schemes: ColorScheme[] = Enum.values(ColorScheme);

  /** The scheme of a first visit; `System` follows `prefers-color-scheme`. */
  override defaultScheme: ColorScheme = ColorScheme.System;

  /** `<meta name="theme-color">` per scheme. */
  override themeColor: BaseThemingConfig["themeColor"] = {
    ...this.themeColor,
    light: ACME_THEME.colors.background.hexLight,
    dark: ACME_THEME.colors.background.hexDark,
  };

  /** Whether a resolved site's colours are layered over the theme's by the site frame. */
  override tenantOverride = true;
}
