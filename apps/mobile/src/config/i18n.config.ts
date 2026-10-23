/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/i18n's configuration: the locales. Gen reads it for the
 *          `#stackra/i18n` loaders (every namespace must provide every locale), the direction
 *          switch of the generated entry (`I18nManager.forceRTL` and Uniwind's layout direction),
 *          one Maestro run per locale, and the iOS `CFBundleLocalizations` list.
 * Boundary: an override declares `override` members only and inherits the base's key (`i18n`);
 *           its presence mounts the i18n context. Messages are ICU only. Values may be overridden
 *           per environment by runway.yaml `environments.<env>.config`. Fields typed by an enum
 *           restate their type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0295 (decision 10), ADR 0080, ADR 0192
 */
import { I18nConfig, Locale, NumberingSystem } from "@stackra/i18n";

/** English and Arabic; a missing key in `ar` renders the `en` string, never the raw key. */
export class MobileI18nConfig extends I18nConfig {
  /** Every locale the binary ships; each namespace must provide all of them. */
  override locales: Locale[] = [Locale.En, Locale.Ar];

  /** The locale of a first launch whose device locale is not listed. */
  override defaultLocale: Locale = Locale.En;

  /** Right-to-left set; gen adds a Maestro run per entry and flips the native layout direction. */
  override rtl: Locale[] = [Locale.Ar];

  /** Per locale, the locales a missing key falls back to, in order. */
  override fallbacks: Record<string, Locale[]> = { ar: [Locale.En], en: [] };

  /** Arabic-Indic digits are the user's choice (ADR 0192 decision 2), never forced. */
  override numerals: NumberingSystem = NumberingSystem.User;

  /** First launch takes the device locale when it is one of `locales`. */
  override followDevice = true;

  /** Fail gen on a namespace that misses a locale; off only warns. */
  override failOnMissingLocale = true;
}
