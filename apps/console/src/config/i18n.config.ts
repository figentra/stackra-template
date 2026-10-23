/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/i18n's configuration: the locales. Gen reads it for
 *          the `#stackra/i18n` loaders (every namespace must provide every locale), the
 *          `chromium-rtl` e2e project, the manifest `lang` and `dir`, and the desktop menu
 *          translations.
 * Boundary: an override declares `override` members only and inherits the base's key (`i18n`);
 *           per-environment values come through runway `config.i18n`. Fields typed by an enum
 *           restate their type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0080, ADR 0192 (Arabic defaults)
 */
import { I18nConfig, Locale, NumberingSystem } from "@stackra/i18n";

/** Locales of the console, read by gen for the `#stackra/i18n` loaders. */
export class ConsoleI18nConfig extends I18nConfig {
  /** Every locale the console ships. */
  override locales: Locale[] = [Locale.En, Locale.Ar];

  /** The locale of a first visit without a stored choice. */
  override defaultLocale: Locale = Locale.En;

  /** Right-to-left set; gen adds an RTL e2e project per entry. */
  override rtl: Locale[] = [Locale.Ar];

  /** Per-locale fallback chain; a missing key renders the fallback string, never the raw key. */
  override fallbacks: Record<string, Locale[]> = {
    ar: [Locale.En],
    en: [],
  };

  /** Digits used when the tenant has not chosen. */
  override numerals: NumberingSystem = NumberingSystem.Latn;

  /** Whether the tenant setting may switch Arabic text to Arabic-Indic digits (ADR 0192). */
  override tenantChoosesNumerals = true;

  /** Fail gen on a namespace that misses a locale instead of warning. */
  override failOnMissingLocale = true;

  /** Cookie the browser writes to remember the user's choice. */
  override cookieName = "locale";
}
