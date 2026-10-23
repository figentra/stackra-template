/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/i18n's configuration: the locales, including the
 *          regional variants `en-US` and `ar-SA`, their fallback chains, the URL prefixes and the
 *          digits. Gen reads it for the `#stackra/i18n` loaders, the RTL e2e projects, one
 *          manifest, one HTML page and one prerendered offline page per locale, and the desktop
 *          menu translations.
 * Boundary: an override keeps the base's name and imports the base as `BaseI18nConfig`; it sets
 *           `override` field defaults only and inherits the base's key (`i18n`); per-environment
 *           values come through runway `config.i18n`. A regional locale is an overlay: its folder
 *           under `assets/lang/` holds only the keys that differ, and every other key resolves
 *           along its chain (`ar-SA` → `ar` → `en`). A base locale must provide every namespace; an
 *           overlay may provide any subset. URL prefixes are the lowercase BCP 47 tag (`/ar/`,
 *           `/ar-sa/`, `/en-us/`); the default locale has none. Where the logic lives: this class
 *           declares, `@stackra/i18n` resolves at run time (negotiation, the chain, ICU plurals,
 *           `lang` and `dir`), and gen checks the files and writes the loaders.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0080, ADR 0192 (Arabic defaults), ADR 0297 (lowercase locale
 *                     prefixes)
 */
import {
  I18nConfig as BaseI18nConfig,
  Locale,
  LocaleUrlStrategy,
  NumberingSystem,
} from "@stackra/i18n";

/** Locales of the console, read by gen for the `#stackra/i18n` loaders. */
export class I18nConfig extends BaseI18nConfig {
  /** Every locale the console ships: two base languages and one regional overlay each. */
  override locales: Locale[] = [Locale.En, Locale.EnUs, Locale.Ar, Locale.ArSa];

  /** The locale of a first visit without a stored choice or a matching browser language. */
  override defaultLocale: Locale = Locale.En;

  /** Right-to-left set; gen adds an RTL e2e project per entry. */
  override rtl: Locale[] = [Locale.Ar, Locale.ArSa];

  /**
   * Per-locale fallback chain, nearest first; a missing key renders the first locale in the chain
   * that has it, never the raw key. A regional locale falls back to its language, then to the
   * default.
   */
  override fallbacks: Record<string, Locale[]> = {
    "en-US": [Locale.En],
    "ar-SA": [Locale.Ar, Locale.En],
    ar: [Locale.En],
    en: [],
  };

  /** `/quick-order` for the default locale, `/ar-sa/quick-order` for the rest, always lowercase. */
  override urlStrategy: LocaleUrlStrategy = LocaleUrlStrategy.PrefixExceptDefault;

  /** Digits used when the tenant has not chosen. */
  override numerals: NumberingSystem = NumberingSystem.Latn;

  /** Whether the tenant setting may switch Arabic text to Arabic-Indic digits (ADR 0192). */
  override tenantChoosesNumerals = true;

  /** Fail gen on a base locale missing a namespace, or an overlay key the base lacks. */
  override failOnMissingLocale = true;

  /** Cookie the browser writes to remember the user's choice. */
  override cookieName = "locale";
}
