/**
 * Stackra file contract:
 * Purpose: the site's top bar: name, the navigation from `SiteMenu` (links, groups with their
 *          sub-navigation, an external link), the locale switcher and the colour-scheme toggle.
 * Boundary: presentation. Route items are generated route keys resolved by the menu, so a visitor
 *           on `/ar` stays on `/ar/...`; an item behind a flag is already left out by `useMenu`. A
 *           group is a disclosure (`<details>`), the navigation pattern WAI-ARIA recommends: it
 *           opens before hydration, and after it the open group is a state field that closes when a
 *           link is followed. An external link opens a new tab, says so to assistive tech and never
 *           passes the opener. The scheme is `@stackra/theming`'s, which persists it and writes
 *           `data-theme` on `<html>`. No data fetching.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components and icon names), ADR 0080 (keys, logical CSS), ADR 0165 (UI
 *                     through @stackra/ui)
 */
import { useTranslation } from "@stackra/i18n/react";
import { MenuItemKind, type ResolvedMenuItem } from "@stackra/navigation";
import { NavLink, useMenu } from "@stackra/navigation/react";
import { ColorScheme } from "@stackra/theming";
import { useColorScheme } from "@stackra/theming/react";
import { Button, Icon, Surface } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { LocaleSwitcher } from "#src/components/locale-switcher";
import { SiteMenu } from "#src/menus/site.menu";
import type { SiteHeaderProps } from "./site-header.props";

/**
 * A `<header>` landmark with one `<nav>`; the active link is `aria-current="page"` through NavLink.
 */
export class SiteHeader extends Component<SiteHeaderProps> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** The header's items, resolved to the visitor's locale mount, flag-hidden items left out. */
  items = useMenu(SiteMenu);

  /** The visitor's colour scheme and its setter. */
  scheme = useColorScheme();

  /** The label key of the open group; none is open at first. */
  openGroup?: string;

  /** Whether the page is dark now (the system preference resolved). */
  get isDark() {
    return this.scheme.resolved === ColorScheme.Dark;
  }

  /** Keeps the open group in step with the disclosure the visitor toggled. */
  toggleGroup(label: string, isOpen: boolean) {
    if (isOpen) this.openGroup = label;
    else if (this.openGroup === label) this.openGroup = undefined;
  }

  /** Closes the open group once one of its links is followed. */
  closeGroup() {
    this.openGroup = undefined;
  }

  /** One item: a route link, an external link, or a group with its sub-navigation. */
  renderItem(item: ResolvedMenuItem) {
    const { t } = this.translation;
    switch (item.kind) {
      case MenuItemKind.Route:
        return (
          <NavLink
            to={item.to}
            end={item.end}
            onClick={() => this.closeGroup()}
            className={({ isActive }) => (isActive ? "font-medium" : "text-ink-muted")}
          >
            {t(item.label)}
          </NavLink>
        );
      case MenuItemKind.Link:
        return (
          <a
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1 text-ink-muted"
          >
            {t(item.label)}
            {item.external && (
              <>
                <Icon name="external-link" aria-hidden className="size-3.5" />
                <span className="sr-only">{t(I18n.web.nav.new_tab)}</span>
              </>
            )}
          </a>
        );
      case MenuItemKind.Group:
        return (
          <details
            className="relative"
            open={this.openGroup === item.label}
            onToggle={(event) => this.toggleGroup(item.label, event.currentTarget.open)}
          >
            <summary className="cursor-pointer list-none text-ink-muted">{t(item.label)}</summary>
            <Surface
              render={<ul />}
              className={`absolute inset-inline-start-0 top-full z-20 mt-2 flex min-w-48 flex-col
                gap-2 rounded-panel p-3 shadow-lg`}
            >
              {item.items.map((child) => (
                <li key={child.label}>{this.renderItem(child)}</li>
              ))}
            </Surface>
          </details>
        );
      default:
        return null;
    }
  }

  /** Home link, navigation, locale switcher and scheme toggle in one row. */
  render() {
    const { t } = this.translation;
    return (
      <Surface render={<header />} className="sticky top-0 z-10 border-b border-ink-muted/20">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 md:px-6">
          <NavLink to={Routes.landing} className="font-semibold" end>
            {this.props.siteName}
          </NavLink>
          <nav aria-label={t(I18n.web.nav.main)} className="ms-auto">
            <ul className="flex items-center gap-4">
              {this.items.map((item) => (
                <li key={item.label}>{this.renderItem(item)}</li>
              ))}
            </ul>
          </nav>
          <LocaleSwitcher locale={this.props.locale} />
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={t(I18n.web.theme.toggle)}
            aria-pressed={this.isDark}
            onPress={() =>
              this.scheme.setScheme(this.isDark ? ColorScheme.Light : ColorScheme.Dark)
            }
          >
            <Icon name={this.isDark ? "moon" : "sun"} aria-hidden />
          </Button>
        </div>
      </Surface>
    );
  }
}
