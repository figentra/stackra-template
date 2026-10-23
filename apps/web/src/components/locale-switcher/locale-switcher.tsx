/**
 * Stackra file contract:
 * Purpose: a select that moves the visitor to the same page in another locale.
 * Boundary: navigation only (`/pricing` ↔ `/ar/pricing`): `useLocaleHref` swaps the current route's
 *           locale mount and keeps the search string; the server sets `lang` and `dir` from the new
 *           URL, never a redirect or a cookie. A native select on purpose: it works before
 *           hydration and on every screen reader.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14), ADR 0297 (decision 4), ADR 0165 (React Router 7)
 */
import { useConfig } from "@stackra/config/react";
import { I18nConfig, type Locale } from "@stackra/i18n";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { useLocaleHref, useNavigate } from "@stackra/navigation/react";
import { I18n } from "#stackra/i18n";

/** The current locale, so the select shows it. */
export interface LocaleSwitcherProps {
  /** The locale of the page being viewed. */
  readonly locale: Locale;
}

/** Changing the value navigates to the same route in the chosen locale. */
export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const { t } = useTranslation();
  const { endonym } = useLocale();
  const i18n = useConfig(I18nConfig);
  const hrefFor = useLocaleHref();
  const navigate = useNavigate();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t(I18n.web.nav.locale)}</span>
      <select
        className="rounded-field border border-ink-muted/20 bg-background px-2 py-1"
        value={locale}
        onChange={(event) => {
          const next = i18n.locales.find((code) => code === event.target.value);
          if (next) navigate(hrefFor(next));
        }}
      >
        {i18n.locales.map((option) => (
          <option key={option} value={option} lang={option}>
            {endonym(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
