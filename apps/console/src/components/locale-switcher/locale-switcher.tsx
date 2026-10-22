/**
 * Stackra file contract:
 * Purpose: the top-bar control that switches between the enabled locales (English, Arabic) and
 *          flips the direction.
 * Boundary: calls the i18n package only; `lang` and `dir` on `<html>` are the package's job. The
 *           choice is remembered by the package in `prefs` and sent as `Accept-Language` by the
 *           generated clients so server messages match.
 * Runtime: browser
 * Governing contract: ADR 0080 (i18n owns lang/dir), ADR 0192 (Arabic defaults)
 */
import { Dropdown, Button } from "@stackra/ui";
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
      <Dropdown.Trigger>
        <Button variant="tertiary" size="sm" aria-label={t(I18n.console.locale.switch)}>
          <Icon name={Icons.Globe} aria-hidden />
          {endonym(locale)}
        </Button>
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
