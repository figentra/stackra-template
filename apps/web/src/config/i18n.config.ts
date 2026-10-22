/**
 * Stackra file contract:
 * Purpose: one fact: the locales and how a locale appears in the URL (a path prefix, the default
 *          unprefixed). Gen mounts the route tree once per locale, expands `prerender` per locale,
 *          adds the `chromium-rtl` project and sets `<html lang dir>`.
 * Boundary: a config class; the Latin-digit default is the public site's (no tenant choice to defer
 *           to, ADR 0192).
 * Runtime: isomorphic
 * Governing contract: ADR 0080, ADR 0192
 */
import { Config } from "@stackra/config";
import { Locale, LocaleUrlStrategy, NumberingSystem } from "@stackra/i18n";
import { Bool, List, Map, OneOf, Str } from "@stackra/validation";

/** Locales of the web app and how a locale appears in the URL. */
@Config("web.i18n")
export class I18nConfig {
  /** Every locale the site ships. @defaultValue [Locale.En, Locale.Ar] */
  @List(OneOf(Locale)) locales = [Locale.En, Locale.Ar];
  /** The unprefixed locale. @defaultValue Locale.En */
  @OneOf(Locale) defaultLocale = Locale.En;
  /** Right-to-left set; gen adds an RTL e2e project per entry. @defaultValue [Locale.Ar] */
  @List(OneOf(Locale)) rtl = [Locale.Ar];
  /** Per-locale fallback chain; a missing key renders the fallback string, never the raw key. */
  @Map(List(OneOf(Locale))) fallbacks: Record<string, Locale[]> = { ar: [Locale.En], en: [] };
  /** Digits on the public site. @defaultValue NumberingSystem.Latn */
  @OneOf(NumberingSystem) numerals = NumberingSystem.Latn;
  /**
   * `/pricing` for the default locale, `/ar/pricing` for the rest.
   * @defaultValue LocaleUrlStrategy.PrefixExceptDefault
   */
  @OneOf(LocaleUrlStrategy) urlStrategy = LocaleUrlStrategy.PrefixExceptDefault;
  /** Fail gen on a namespace that misses a locale instead of warning. @defaultValue true */
  @Bool() failOnMissingLocale = true;
  /** Cookie that remembers the visitor's choice. @defaultValue "locale" */
  @Str() cookieName = "locale";
}
