/**
 * Stackra file contract:
 * Purpose: the site's top bar: name, the navigation from `SiteMenu`, the locale switcher and the
 *          colour-scheme toggle.
 * Boundary: presentation. Links are route classes from the menu, so a visitor on `/ar` stays on
 *           `/ar/...`; the scheme is `@stackra/theming`'s, which persists it and writes
 *           `data-theme` on `<html>`. No data fetching.
 * Runtime: browser
 * Governing contract: ADR 0294 d14, ADR 0080 (keys, logical CSS), ADR 0165 (UI
 *                     through @stackra/ui)
 */
import { useTranslation } from "@stackra/i18n/react";
import type { Locale } from "@stackra/i18n";
import { NavLink, useMenu } from "@stackra/navigation/react";
import { ColorScheme } from "@stackra/theming";
import { useColorScheme } from "@stackra/theming/react";
import { Button, Surface } from "@stackra/ui";
import { Icon, Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { LocaleSwitcher } from "#src/components/locale-switcher";
import { SiteMenu } from "#src/menus/site.menu";
import { Routes } from "#stackra/routes";

/** What the layout knows and the header needs. */
export interface SiteHeaderProps {
  /** Shown as the home link's text. */
  readonly siteName: string;
  /** The current locale, for the switcher. */
  readonly locale: Locale;
}

/**
 * A `<header>` landmark with one `<nav>`; the active link is `aria-current="page"` through NavLink.
 */
export function SiteHeader({ siteName, locale }: SiteHeaderProps) {
  const { t } = useTranslation();
  const items = useMenu(SiteMenu);
  const { resolved, setScheme } = useColorScheme();
  const isDark = resolved === ColorScheme.Dark;
  return (
    <Surface render={<header />} className="sticky top-0 z-10 border-b border-ink-muted/20">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 md:px-6">
        <NavLink to={Routes.landing} className="font-semibold" end>
          {siteName}
        </NavLink>
        <nav aria-label={t(I18n.web.nav.main)} className="ms-auto flex items-center gap-4">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "font-medium" : "text-ink-muted")}
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <LocaleSwitcher locale={locale} />
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          aria-label={t(I18n.web.theme.toggle)}
          aria-pressed={isDark}
          onPress={() => setScheme(isDark ? ColorScheme.Light : ColorScheme.Dark)}
        >
          <Icon name={isDark ? Icons.Moon : Icons.Sun} aria-hidden />
        </Button>
      </div>
    </Surface>
  );
}
