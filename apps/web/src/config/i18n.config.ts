/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/i18n's configuration: the locales and how a locale
 *          appears in the URL. Gen mounts the route tree once per locale under its own lowercase
 *          prefix (the default unprefixed), adds the `chromium-rtl` project and sets
 *          `<html lang dir>`.
 * Boundary: an override declares `override` members only and inherits the base's key (`i18n`).
 *           The URL alone selects the locale: the server never redirects an HTML request because of
 *           the cookie or `Accept-Language`, and sends no `Vary`; the cookie only remembers the
 *           visitor's last choice, which the switcher and the locale suggestion banner write in the
 *           browser. The Latin-digit default is the public site's (no tenant choice to defer to,
 *           ADR 0192). Fields typed by an enum restate their type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0297 (decision 4), ADR 0080, ADR 0192
 */
import { I18nConfig, Locale, LocaleUrlStrategy, NumberingSystem } from "@stackra/i18n";

/** Locales of the site and how a locale appears in the URL. */
export class WebI18nConfig extends I18nConfig {
  /** Every locale the site ships. */
  override locales: Locale[] = [Locale.En, Locale.Ar];

  /** The unprefixed locale. */
  override defaultLocale: Locale = Locale.En;

  /** Right-to-left set; gen adds an RTL e2e project per entry. */
  override rtl: Locale[] = [Locale.Ar];

  /** Per-locale fallback chain; a missing key renders the fallback string, never the raw key. */
  override fallbacks: Record<string, Locale[]> = {
    ar: [Locale.En],
    en: [],
  };

  /** Digits on the public site. */
  override numerals: NumberingSystem = NumberingSystem.Latn;

  /** `/pricing` for the default locale, `/ar/pricing` for the rest. */
  override urlStrategy: LocaleUrlStrategy = LocaleUrlStrategy.PrefixExceptDefault;

  /** Fail gen on a namespace that misses a locale instead of warning. */
  override failOnMissingLocale = true;

  /** Remembers the visitor's last choice in the browser; never read to redirect. */
  override cookieName = "locale";
}
