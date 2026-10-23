/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/i18n's configuration: the locales. Gen reads it for the
 *          `#stackra/i18n` loaders (every namespace must provide every base locale), the direction
 *          switch of the generated entry (`I18nManager.forceRTL` and Uniwind's layout direction),
 *          one Maestro run per locale, and the iOS `CFBundleLocalizations` list.
 * Boundary: an override declares `override` members only and inherits the base's key (`i18n`); its
 *           presence mounts the i18n context. Messages are ICU only. Locales are BCP 47 (`ar-SA`,
 *           `en-US`): a base language (`en`, `ar`) has a complete file per namespace in
 *           `assets/lang/<locale>/`; a regional overlay holds only the keys whose wording differs
 *           in that region and falls back through `fallbacks`, so a key is never duplicated to make
 *           a region complete. The device locale picks the closest listed locale (`en-GB` takes
 *           `en`, `ar-SA` its overlay). Values may be overridden per environment by runway.yaml
 *           `environments.<env>.config`. Fields typed by an enum restate their type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md: Base
 *                     alias), ADR 0295 (decision 10), ADR 0080, ADR 0192, ADR 0234
 */
import { I18nConfig as BaseI18nConfig, Locale, NumberingSystem } from "@stackra/i18n";

/** English and Arabic with US and Saudi overlays; a missing key never renders the raw key. */
export class I18nConfig extends BaseI18nConfig {
  /** Every locale the binary ships: the two base languages and their regional overlays. */
  override locales: Locale[] = [Locale.En, Locale.EnUs, Locale.Ar, Locale.ArSa];

  /** The locale of a first launch whose device locale matches none of `locales`. */
  override defaultLocale: Locale = Locale.En;

  /** Right-to-left set; gen adds a Maestro run per entry and flips the native layout direction. */
  override rtl: Locale[] = [Locale.Ar, Locale.ArSa];

  /**
   * Per locale, the locales a missing key falls back to, in order: an overlay to its base
   * language, then to the default; Arabic to English, never to the raw key.
   */
  override fallbacks: Record<string, Locale[]> = {
    "en-US": [Locale.En],
    "ar-SA": [Locale.Ar, Locale.En],
    ar: [Locale.En],
    en: [],
  };

  /** Arabic-Indic digits are the user's choice (ADR 0192 decision 2), never forced. */
  override numerals: NumberingSystem = NumberingSystem.User;

  /** First launch takes the closest listed locale to the device locale. */
  override followDevice = true;

  /** Fail gen on a namespace that misses a base locale; off only warns. */
  override failOnMissingLocale = true;
}
