/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/theming's configuration: the look. The one logo source
 *          (favicon and the OG template mark derive from it), schemes, theme colours, and whether a
 *          resolved site's brand may override the defaults.
 * Boundary: an override declares `override` members only and inherits the base's key (`theming`);
 *           the theme colours spread the base first. Tokens themselves are `@acme/brand`; a tenant
 *           site's brand arrives at runtime with the resolved site and is layered over the
 *           defaults by the site frame. This is the one app where per-tenant brand is real.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0080 d4, ADR 0234 (asset keys)
 */
import { ColorScheme, ThemingConfig } from "@stackra/theming";
import { Enum } from "@stackra/validation";
import { Assets } from "#stackra/assets";

/** Look of the site: logo source, schemes, theme colours and the tenant override switch. */
export class WebThemingConfig extends ThemingConfig {
  /** The one SVG the favicon and the OG mark derive from. */
  override logo = Assets.web.public.logo_svg;

  /** Schemes the visitor may choose between. */
  override schemes: ColorScheme[] = Enum.values(ColorScheme);

  /** The scheme of a first visit; `System` follows `prefers-color-scheme`. */
  override defaultScheme: ColorScheme = ColorScheme.System;

  /** `<meta name="theme-color">` per scheme. */
  override themeColor: ThemingConfig["themeColor"] = {
    ...this.themeColor,
    light: "#f7f7f5",
    dark: "#1c1e22",
  };

  /** Whether a resolved site's brand tokens are layered over the defaults by the site frame. */
  override tenantOverride = true;
}
