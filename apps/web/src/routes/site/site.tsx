/**
 * Stackra file contract:
 * Purpose: the component of `SiteLayout`, bound by name: the tenant's colours, the skip link,
 *          header, the locale suggestion, outlet, footer and the consent banner.
 * Boundary: the layout owns nothing a page shows. A tenant's colour roles become the theme's CSS
 *           variables through one `<Style>`, only when theming.config.ts allows it: they are laid
 *           over the `acme` theme of `@acme/theme`, checked by `defineTheme` from `@stackra/tokens`
 *           (every value must match the CSS grammar of its kind, so nothing a tenant saved can
 *           escape its declaration) and rendered by `renderWebCss`. Colours that fail the check are
 *           dropped and the `acme` theme alone applies. The element carries the request's CSP
 *           nonce, so the policy needs no `unsafe-inline`. A document never carries CSS.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0302 (design system tokens), ADR 0175
 *                     (sites by host), ADR 0112 (no markup in documents), ADR 0297 (decision 4: the
 *                     locale suggestion)
 */
import { ACME_THEME } from "@acme/theme";
import { useConfig } from "@stackra/config/react";
import { Style } from "@stackra/csp/react";
import { useTranslation } from "@stackra/i18n/react";
import { Outlet } from "@stackra/navigation/react";
import { ThemingConfig } from "@stackra/theming";
import { defineTheme, InvalidThemeError, renderWebCss } from "@stackra/tokens";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { ConsentBanner } from "#src/components/consent-banner";
import { LocaleSuggestion } from "#src/components/locale-suggestion";
import { SiteFooter } from "#src/components/site-footer";
import { SiteHeader } from "#src/components/site-header";
import { useSite } from "#src/hooks/use-site";

/** The tenant's colours are serialised only when the theming config allows the override. */
export class Site extends Component {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** The site the layout resolved for this request. */
  site = useSite();

  /** The theming config; `tenantOverride` gates the tenant's colours. */
  theming = useConfig(ThemingConfig);

  /**
   * The stylesheet of the `acme` theme with the tenant's colour roles laid over it, or `null` when
   * the override is off, the tenant set no colour, or a colour fails the token grammar.
   */
  get brandCss(): string | null {
    if (!this.theming.tenantOverride || Object.keys(this.site.brand).length === 0) return null;
    try {
      const colors = { ...ACME_THEME.colors, ...this.site.brand };
      return renderWebCss(defineTheme({ ...ACME_THEME, name: "tenant", colors }));
    } catch (error) {
      // the experience service validates colours on save; a value that still fails is dropped
      if (error instanceof InvalidThemeError) return null;
      throw error;
    }
  }

  /** The frame around the outlet, skip link first. */
  render() {
    const { t } = this.translation;
    const css = this.brandCss;
    return (
      <>
        {css && <Style data-brand>{css}</Style>}
        <a className="skip-link" href="#main">
          {t(I18n.web.nav.skip)}
        </a>
        <SiteHeader siteName={this.site.name} locale={this.site.locale} />
        <LocaleSuggestion locale={this.site.locale} />
        <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <Outlet />
        </main>
        <SiteFooter siteName={this.site.name} />
        <ConsentBanner />
      </>
    );
  }
}
