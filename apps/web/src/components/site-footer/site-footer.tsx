/**
 * Stackra file contract:
 * Purpose: the site's footer: rights line and the legal navigation from `FooterMenu`.
 * Boundary: presentation only; the items are the menu's, so they land in the visitor's locale and a
 *           tenant adds a legal page by changing the menu, never this component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0114 (legal pages are builder pages)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Link, useMenu } from "@stackra/navigation/react";
import { Component } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { FooterMenu } from "#src/menus/footer.menu";
import type { SiteFooterProps } from "./site-footer.props";

/** A `<footer>` landmark with a labelled legal navigation. */
export class SiteFooter extends Component<SiteFooterProps> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** The legal links, resolved to the visitor's locale mount. */
  items = useMenu(FooterMenu);

  /** The calendar year of the first render; a state field, so render stays pure. */
  year = new Date().getFullYear();

  /** The rights line and the legal navigation. */
  render() {
    const { t } = this.translation;
    return (
      <footer className="mt-16 border-t border-ink-muted/20 py-8 text-sm text-ink-muted">
        <div
          className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between
            gap-4 px-4 md:px-6`}
        >
          <p>{t(I18n.web.footer.rights, { year: this.year, name: this.props.siteName })}</p>
          <nav aria-label={t(I18n.web.footer.legal)} className="flex gap-4">
            {this.items.map((item) => (
              <Link key={item.label} to={item.to}>
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    );
  }
}
