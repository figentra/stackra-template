/**
 * Stackra file contract:
 * Purpose: one fact: the locales. Gen reads it for the `#stackra/i18n` loaders (every namespace
 *          must provide every locale), the direction switch in the entry (`I18nManager.forceRTL` +
 *          Uniwind `LayoutDirection`), one Maestro run per locale, and the iOS
 *          `CFBundleLocalizations` list.
 * Boundary: a config class; types from the declarations, validation from the field rules, no Zod
 *           visible. Messages are ICU only. Values may be overridden per environment by
 *           `runway.yaml` `environments.<env>.config`.
 * Runtime: isomorphic
 * Governing contract: ADR 0080, ADR 0192
 */
import { Config } from "@stackra/config";
import { Locale, NumberingSystem } from "@stackra/i18n";
import { Bool, List, Map, OneOf } from "@stackra/validation";

/**
 * The locale set. `fallbacks` is per locale: a missing key in `ar` renders the `en` string, never
 * the raw key.
 */
@Config("mobile.i18n")
export class I18nConfig {
  /** Every locale the binary ships; each namespace must provide all of them. */
  @List(OneOf(Locale)) locales = [Locale.En, Locale.Ar];
  /** The locale of a first launch whose device locale is not listed. @defaultValue Locale.En */
  @OneOf(Locale) defaultLocale = Locale.En;
  /** Right-to-left set; gen adds a Maestro run per entry and flips the native layout direction. */
  @List(OneOf(Locale)) rtl = [Locale.Ar];
  /** Per locale, the locales a missing key falls back to, in order. */
  @Map(List(OneOf(Locale))) fallbacks: Record<string, Locale[]> = { ar: [Locale.En], en: [] };
  /**
   * Arabic-Indic digits are the user's choice (ADR 0192 d2), never forced. @defaultValue
   * NumberingSystem.User
   */
  @OneOf(NumberingSystem) numerals = NumberingSystem.User;
  /** First launch takes the device locale when it is one of `locales`. */
  @Bool() followDevice = true;
  /** Fail gen on a namespace that misses a locale; off only warns. @defaultValue true */
  @Bool() failOnMissingLocale = true;
}
