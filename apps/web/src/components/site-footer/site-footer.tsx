/**
 * Stackra file contract:
 * Purpose: the site's footer: rights line and the legal navigation from `FooterMenu`.
 * Boundary: presentation only; the items are the menu's, so they land in the visitor's locale and
 *           a tenant adds a legal page by changing the menu, never this component.
 * Runtime: browser
 * Governing contract: ADR 0114 (legal pages are builder pages)
 */
import { useState } from "react";
import { useTranslation } from "@stackra/i18n/react";
import { Link, useMenu } from "@stackra/navigation/react";
import { I18n } from "#stackra/i18n";
import { FooterMenu } from "#src/menus/footer.menu";

/** What the footer shows beyond its keys. */
export interface SiteFooterProps {
  /** The site's name in the rights line. */
  readonly siteName: string;
}

/** The current calendar year; read once per mount, so render stays pure. */
function currentYear(): number {
  return new Date().getFullYear();
}

/** A `<footer>` landmark with a labelled legal navigation. */
export function SiteFooter({ siteName }: SiteFooterProps) {
  const { t } = useTranslation();
  const [year] = useState(currentYear);
  const items = useMenu(FooterMenu);
  return (
    <footer className="mt-16 border-t border-ink-muted/20 py-8 text-sm text-ink-muted">
      <div
        className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between
          gap-4 px-4 md:px-6`}
      >
        <p>{t(I18n.web.footer.rights, { year, name: siteName })}</p>
        <nav aria-label={t(I18n.web.footer.legal)} className="flex gap-4">
          {items.map((item) => (
            <Link key={item.label} to={item.to}>
              {t(item.label)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
