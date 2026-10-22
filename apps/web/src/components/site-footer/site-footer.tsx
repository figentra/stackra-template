/**
 * Stackra file contract:
 * Purpose: the site's footer: rights line and the legal links, which are tenant builder pages
 *          (`privacy`, `terms`) served by the catch-all `Routes.page`.
 * Boundary: presentation only; links are the page route with its splat, so they land in the
 *           visitor's locale.
 * Runtime: browser
 * Governing contract: ADR 0128, ADR 0114 (legal pages are builder pages), ADR 0071 (privacy page is
 *                     required)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Link } from "@stackra/navigation/react";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** What the footer shows beyond its keys. */
export interface SiteFooterProps {
  /** The site's name in the rights line. */
  readonly siteName: string;
}

/** A `<footer>` landmark with a labelled legal navigation. */
export function SiteFooter({ siteName }: SiteFooterProps) {
  const { t } = useTranslation();
  return (
    <footer className="mt-16 border-t border-ink-muted/20 py-8 text-sm text-ink-muted">
      <div
        className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between
          gap-4 px-4 md:px-6`}
      >
        <p>{t(I18n.web.footer.rights, { year: new Date().getFullYear(), name: siteName })}</p>
        <nav aria-label={t(I18n.web.footer.legal)} className="flex gap-4">
          <Link to={Routes.page} params={{ "*": "privacy" }}>
            {t(I18n.web.footer.privacy)}
          </Link>
          <Link to={Routes.page} params={{ "*": "terms" }}>
            {t(I18n.web.footer.terms)}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
