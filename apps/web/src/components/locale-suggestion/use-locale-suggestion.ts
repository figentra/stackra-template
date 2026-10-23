/**
 * Stackra file contract:
 * Purpose: the locale suggestion banner's state: the other locale the browser prefers, when the
 *          site ships it and the visitor has not chosen a locale yet, and the two answers.
 * Boundary: browser only. The preference is read from `navigator.languages` in an effect, after the
 *           first paint, never from `Accept-Language` on the server, so nothing about it reaches
 *           the shared HTML and no response varies. The choice is i18n's remembered locale (the
 *           `locale` cookie of i18n.config.ts), written only when the visitor answers and never
 *           read to redirect; the locale switcher writes the same record.
 * Runtime: browser
 * Governing contract: ADR 0297 (decision 4), ADR 0080, ADR 0294 (decision 14)
 */
import { useConfig } from "@stackra/config/react";
import { I18nConfig, type Locale } from "@stackra/i18n";
import { useLocaleChoice } from "@stackra/i18n/react";
import { useLocaleHref, useNavigate } from "@stackra/navigation/react";
import { useEffect, useState } from "react";

/** What the banner renders and does. */
export interface LocaleSuggestionState {
  /** The locale to offer; null when there is nothing to offer. */
  readonly suggested: Locale | null;
  /** Records the suggested locale as the visitor's choice and opens the same page in it. */
  readonly accept: () => void;
  /** Records the current locale as the visitor's choice; the banner hides for good. */
  readonly dismiss: () => void;
}

/** The language part of a BCP 47 tag (`ar` of `ar-sa`). */
const languageOf = (tag: string): string => tag.toLowerCase().split("-")[0] ?? "";

/**
 * The first shipped locale the browser lists: by the exact tag, else by its language part, in the
 * browser's order of preference.
 */
function preferredLocale(languages: readonly string[], locales: readonly Locale[]): Locale | null {
  for (const tag of languages) {
    const wanted = tag.toLowerCase();
    const match =
      locales.find((locale) => locale.toLowerCase() === wanted) ??
      locales.find((locale) => languageOf(locale) === languageOf(wanted));
    if (match) return match;
  }
  return null;
}

/** Offers nothing on the server, on the first paint, or once the visitor has chosen a locale. */
export function useLocaleSuggestion(current: Locale): LocaleSuggestionState {
  const i18n = useConfig(I18nConfig);
  const choice = useLocaleChoice();
  const hrefFor = useLocaleHref();
  const navigate = useNavigate();
  const [preferred, setPreferred] = useState<Locale | null>(null);
  useEffect(() => {
    setPreferred(preferredLocale(navigator.languages, i18n.locales));
  }, [i18n.locales]);
  const suggested = preferred !== current && choice.chosen === null ? preferred : null;
  return {
    suggested,
    accept: () => {
      if (!suggested) return;
      choice.choose(suggested);
      navigate(hrefFor(suggested));
    },
    dismiss: () => choice.choose(current),
  };
}
