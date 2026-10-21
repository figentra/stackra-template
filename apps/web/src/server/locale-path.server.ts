/**
 * Stackra file contract:
 * Purpose: the locale prefix rule for absolute URLs the server writes (hreflang alternates, sitemap
 *          entries, JSON-LD breadcrumbs): the default locale has no prefix, every other locale is
 *          prefixed once.
 * Boundary: a pure function; the caller passes the i18n config from its own context. Links inside
 *           the app never use it: a route class resolves to the visitor's locale mount by itself.
 * Runtime: worker
 * Governing contract: ADR 0080 (locales as a path prefix)
 */
import type { Locale } from "@stackra/i18n";
import type { I18nConfig } from "#src/config/i18n.config";

/** `/pricing` in the default locale, `/ar/pricing` in Arabic, `/ar` for the Arabic root. */
export function localePath(i18n: I18nConfig, locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === i18n.defaultLocale) return clean;
  return `/${locale.value}${clean === "/" ? "" : clean}`;
}
