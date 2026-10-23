/**
 * Stackra file contract:
 * Purpose: a select that moves the visitor to the same page in another locale.
 * Boundary: navigation only (`/pricing` ↔ `/ar-sa/pricing`): `useLocaleHref` swaps the current
 *           route's locale mount and keeps the search string; the server sets `lang` and `dir` from
 *           the new URL, never a redirect. The pick is remembered as the visitor's locale choice
 *           (i18n's `locale` cookie, written in the browser and never read to redirect), so the
 *           locale suggestion banner does not offer another locale afterwards. A native select on
 *           purpose: it works before hydration and on every screen reader.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0297 (decision 4), ADR 0165 (React Router 7)
 */
import type { ChangeEvent } from "react";
import { useConfig } from "@stackra/config/react";
import { I18nConfig } from "@stackra/i18n";
import { useLocale, useLocaleChoice, useTranslation } from "@stackra/i18n/react";
import { useLocaleHref, useNavigate } from "@stackra/navigation/react";
import { Component } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import type { LocaleSwitcherProps } from "./locale-switcher.props";

/** Changing the value navigates to the same route in the chosen locale. */
export class LocaleSwitcher extends Component<LocaleSwitcherProps> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** Locale facts; `endonym` names a locale in its own language. */
  localeInfo = useLocale();

  /** The site's locales. */
  i18n = useConfig(I18nConfig);

  /** The visitor's remembered locale choice. */
  choice = useLocaleChoice();

  /** The current route's href in another locale mount. */
  hrefFor = useLocaleHref();

  /** Client-side navigation. */
  navigate = useNavigate();

  /** Records the shipped locale picked in the select and opens the same page in it. */
  change(event: ChangeEvent<HTMLSelectElement>) {
    const next = this.i18n.locales.find((code) => code === event.target.value);
    if (!next) return;
    this.choice.choose(next);
    this.navigate(this.hrefFor(next));
  }

  /** A labelled native select, one option per shipped locale, each named in its own language. */
  render() {
    const { t } = this.translation;
    return (
      <label className="flex items-center gap-2 text-sm">
        <span className="sr-only">{t(I18n.web.nav.locale)}</span>
        <select
          className="rounded-field border border-ink-muted/20 bg-background px-2 py-1"
          value={this.props.locale}
          onChange={(event) => this.change(event)}
        >
          {this.i18n.locales.map((option) => (
            <option key={option} value={option} lang={option}>
              {this.localeInfo.endonym(option)}
            </option>
          ))}
        </select>
      </label>
    );
  }
}
