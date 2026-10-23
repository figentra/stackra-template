/**
 * Stackra file contract:
 * Purpose: the locale suggestion banner: when the browser prefers another locale the site ships,
 *          offer the same page in that locale, without moving the visitor.
 * Boundary: UI over `useLocaleSuggestion`. It renders nothing on the server and on the first client
 *           paint, because the browser's languages are known only in the browser: every visitor
 *           of a URL gets the same HTML, and the server never redirects on a cookie, a language
 *           header or an address (ADR 0297 decision 4). Switching opens the same route in the other
 *           locale mount; either answer is remembered, so the banner does not come back. The
 *           language is named in its own language (its endonym), so a visitor who cannot read the
 *           current page still recognises it.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14), ADR 0297 (decision 4), ADR 0080
 */
import type { Locale } from "@stackra/i18n";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { Button, Surface } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { useLocaleSuggestion } from "./use-locale-suggestion";

/** The locale of the page being viewed. */
export interface LocaleSuggestionProps {
  /** The current locale mount. */
  readonly locale: Locale;
}

/** A labelled region under the header; it never covers the page or takes focus. */
export function LocaleSuggestion({ locale }: LocaleSuggestionProps) {
  const { t } = useTranslation();
  const { endonym } = useLocale();
  const suggestion = useLocaleSuggestion(locale);
  if (!suggestion.suggested) return null;
  const language = endonym(suggestion.suggested);
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
        <Button variant="secondary" size="sm" onPress={suggestion.accept}>
          {t(I18n.web.locale_suggestion.switch, { language })}
        </Button>
        <Button variant="ghost" size="sm" onPress={suggestion.dismiss}>
          {t(I18n.web.locale_suggestion.stay)}
        </Button>
      </div>
    </Surface>
  );
}
