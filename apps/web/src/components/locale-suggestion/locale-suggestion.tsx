/**
 * Stackra file contract:
 * Purpose: the locale suggestion banner: when the browser prefers another locale the site ships,
 *          offer the same page in that locale, without moving the visitor.
 * Boundary: UI over `useLocaleSuggestion`. It renders nothing on the server and on the first client
 *           paint, because the browser's languages are known only in the browser: every visitor of
 *           a URL gets the same HTML, and the server never redirects on a cookie, a language header
 *           or an address (ADR 0297 decision 4). Switching opens the same route in the other locale
 *           mount (`/ar-sa/pricing` for a Saudi browser); either answer is remembered, so the
 *           banner does not come back. The language is named in its own language (its endonym), so
 *           a visitor who cannot read the current page still recognises it.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0297 (decision 4), ADR 0080
 */
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { Button, Surface } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import type { LocaleSuggestionProps } from "./locale-suggestion.props";
import { useLocaleSuggestion } from "./use-locale-suggestion";

/** A labelled region under the header; it never covers the page or takes focus. */
export class LocaleSuggestion extends Component<LocaleSuggestionProps> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** Locale facts; `endonym` names a locale in its own language. */
  localeInfo = useLocale();

  /** The locale to offer and the visitor's two answers. */
  suggestion = useLocaleSuggestion(this.props.locale);

  /** Nothing when there is nothing to offer. */
  render() {
    const { t } = this.translation;
    const { suggested, accept, dismiss } = this.suggestion;
    if (!suggested) return null;
    const language = this.localeInfo.endonym(suggested);
    return (
      <Surface
        render={<section aria-label={t(I18n.web.locale_suggestion.label)} />}
        className="border-b border-ink-muted/20"
      >
        <div
          className={`mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2 text-sm
            md:px-6`}
        >
          <p className="me-auto">{t(I18n.web.locale_suggestion.body, { language })}</p>
          <Button variant="secondary" size="sm" onPress={accept}>
            {t(I18n.web.locale_suggestion.switch, { language })}
          </Button>
          <Button variant="ghost" size="sm" onPress={dismiss}>
            {t(I18n.web.locale_suggestion.stay)}
          </Button>
        </div>
      </Surface>
    );
  }
}
