/**
 * Stackra file contract:
 * Purpose: the top-bar control that switches between the enabled locales (English, Arabic) and
 *          flips the direction.
 * Boundary: calls the i18n package only; `lang` and `dir` on `<html>` are the package's job. The
 *           choice is remembered by the package in `prefs` and sent as `Accept-Language` by the
 *           generated clients so server messages match. The trigger is the dropdown's own button,
 *           as in every other dropdown here, and its accessible name contains the endonym it shows
 *           (WCAG 2.5.3, label in name).
 * Runtime: browser
 * Governing contract: ADR 0080 (i18n owns lang/dir), ADR 0192 (Arabic defaults)
 */
import { Dropdown } from "@stackra/ui";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { Icon, Icons } from "@stackra/ui/icons";
import { I18n, locales } from "#stackra/i18n";

/**
 * A dropdown over `#stackra/i18n`'s `locales`; each item is labelled in its own language (endonym),
 * not translated.
 */
export function LocaleSwitcher() {
  const { t } = useTranslation();
  const { locale, setLocale, endonym } = useLocale();
  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={t(I18n.console.locale.current, { name: endonym(locale) })}
        className="flex items-center gap-2 text-sm"
      >
        <Icon name={Icons.Globe} aria-hidden />
        <span lang={locale}>{endonym(locale)}</span>
      </Dropdown.Trigger>
      <Dropdown.Menu
        selectionMode="single"
        selectedKeys={[locale]}
        onAction={(key) => setLocale(String(key) as typeof locale)}
      >
        {locales.map((code) => (
          <Dropdown.Item key={code} id={code} lang={code} textValue={endonym(code)}>
            {endonym(code)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
