/**
 * Stackra file contract:
 * Purpose: the component of `SiteLayout`, bound by name: the tenant brand variables, the skip link,
 *          header, the locale suggestion, outlet, footer and the consent banner.
 * Boundary: the layout owns nothing a page shows. A tenant's brand becomes `--brand-*` custom
 *           properties through one `<Style>` built by `@acme/brand` (every value checked against
 *           the CSS grammar of its token kind first), only when theming.config.ts allows it; the
 *           element carries the request's CSP nonce, so the policy needs no `unsafe-inline`. A
 *           document never carries CSS.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0175 (sites by host), ADR 0112 (no markup
 *                     in documents), ADR 0297 (decision 4: the locale suggestion)
 */
import { brandCssVariables } from "@acme/brand";
import { useConfig } from "@stackra/config/react";
import { Style } from "@stackra/csp/react";
import { useTranslation } from "@stackra/i18n/react";
import { Outlet } from "@stackra/navigation/react";
import { ThemingConfig } from "@stackra/theming";
import { I18n } from "#stackra/i18n";
import { ConsentBanner } from "#src/components/consent-banner";
import { LocaleSuggestion } from "#src/components/locale-suggestion";
import { SiteFooter } from "#src/components/site-footer";
import { SiteHeader } from "#src/components/site-header";
import { useSite } from "#src/hooks/use-site";

/** The tenant's tokens are serialised only when the theming config allows the override. */
export function Site() {
  const { t } = useTranslation();
  const site = useSite();
  const theming = useConfig(ThemingConfig);
  return (
    <>
      {theming.tenantOverride && <Style data-brand>{brandCssVariables(site.brand)}</Style>}
      <a className="skip-link" href="#main">
        {t(I18n.web.nav.skip)}
      </a>
      <SiteHeader siteName={site.name} locale={site.locale} />
      <LocaleSuggestion locale={site.locale} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Outlet />
      </main>
      <SiteFooter siteName={site.name} />
      <ConsentBanner />
    </>
  );
}
