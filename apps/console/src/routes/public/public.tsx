/**
 * Stackra file contract:
 * Purpose: the component of `PublicLayout`, bound by name: the theme's mark (the console logo)
 *          above the outlet, `main` with the id the skip link targets. Frames the sign-in page and
 *          the offline page gen renders per locale at build time.
 * Boundary: presentation only. A class component; layouts take no props, so it needs no props file;
 *           gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0241, ADR 0234 (asset keys)
 */
import { useAsset } from "@stackra/assets/react";
import { useTranslation } from "@stackra/i18n/react";
import { Outlet } from "@stackra/navigation/react";
import { Component } from "#stackra/ui";
import { Assets } from "#stackra/assets";
import { I18n } from "#stackra/i18n";

/** Logo above the outlet. */
export class Public extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The logo the theming config names, resolved for the active target. */
  logo = useAsset(Assets.console.public.logo_svg);

  /** The centred frame. */
  render() {
    return (
      <main id="main" className="grid min-h-dvh place-items-center gap-6 p-4">
        <img src={this.logo.url} alt={this.i18n.t(I18n.console.shell.brand)} className="h-8" />
        <Outlet />
      </main>
    );
  }
}
