/**
 * Stackra file contract:
 * Purpose: the frame `SiteLayout` renders: the tenant brand variables, the skip link, header,
 *          outlet, footer and the consent banner.
 * Boundary: the layout owns nothing a page shows. A tenant's brand becomes `--brand-*` custom
 *           properties through one style tag built by `@stackra/brand`, only when theming.config.ts
 *           allows it; a document never carries CSS.
 * Runtime: isomorphic
 * Governing contract: ADR 0175 (sites by host), ADR 0080 (logical CSS), ADR 0071 (consent), ADR
 *                     0112 (no markup)
 */
import { brandCssVariables } from "@stackra/brand";
import { useConfig } from "@stackra/config/react";
import { useTranslation } from "@stackra/i18n/react";
import { Outlet } from "@stackra/navigation/react";
import { I18n } from "#stackra/i18n";
import { ConsentBanner } from "#src/components/consent-banner";
import { SiteFooter } from "#src/components/site-footer";
import { SiteHeader } from "#src/components/site-header";
import { ThemingConfig } from "#src/config/theming.config";
import { useSite } from "#src/providers/site/use-site";

/** The tenant's tokens are serialised only when the theming config allows the override. */
export function SiteFrame() {
  const { t } = useTranslation();
  const site = useSite();
  const theming = useConfig(ThemingConfig);
  return (
    <>
      {theming.tenantOverride && (
        <style data-brand dangerouslySetInnerHTML={{ __html: brandCssVariables(site.brand) }} />
      )}
      <a className="skip-link" href="#main">
        {t(I18n.web.nav.skip)}
      </a>
      <SiteHeader siteName={site.name} locale={site.locale} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Outlet />
      </main>
      <SiteFooter siteName={site.name} />
      <ConsentBanner />
    </>
  );
}
