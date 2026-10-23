/**
 * Stackra file contract:
 * Purpose: the top-bar control that switches between the enabled locales (English, Arabic and their
 *          regional variants) and flips the direction.
 * Boundary: calls the i18n package only; `lang` and `dir` on `<html>`, the URL prefix (`/ar-sa/`)
 *           and the remembered choice are the package's job. The generated clients send the locale
 *           as `Accept-Language` so server messages match. The trigger is the dropdown's own
 *           button, as in every other dropdown here, and its accessible name contains the endonym
 *           it shows (WCAG 2.5.3, label in name). A class component; gen compiles it to a function
 *           component.
 * Runtime: browser
 * Governing contract: ADR 0080 (i18n owns lang/dir), ADR 0192 (Arabic defaults), ADR 0294 (as
 *                     amended by programming model v3.1, AGENTS.md: class components)
 */
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { Component, Dropdown, Icon } from "@stackra/ui";
import { I18n, locales } from "#stackra/i18n";

/**
 * A dropdown over `#stackra/i18n`'s `locales`; each item is labelled in its own language (endonym),
 * not translated.
 */
export class LocaleSwitcher extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The active locale, its setter and the endonym lookup. */
  locale = useLocale();

  /** The trigger with the current endonym, and one radio item per locale. */
  render() {
    const { locale, setLocale, endonym } = this.locale;
    return (
      <Dropdown>
        <Dropdown.Trigger
          aria-label={this.i18n.t(I18n.console.locale.current, { name: endonym(locale) })}
          className="flex items-center gap-2 text-sm"
        >
          <Icon name="globe" aria-hidden />
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
}
