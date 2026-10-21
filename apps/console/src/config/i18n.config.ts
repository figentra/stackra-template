/**
 * Stackra file contract:
 * Purpose: one fact: the locales. Gen reads it for the `#stackra/i18n` loaders (every namespace
 *          must provide every locale), the `chromium-rtl` e2e project, the manifest `lang`/`dir`
 *          and the desktop menu translations.
 * Boundary: a config class; per-environment values come through runway `config.console.i18n` (ADR
 *           0146).
 * Runtime: isomorphic
 * Governing contract: ADR 0080, ADR 0192 (Arabic defaults)
 */
import { Config } from "@stackra/config";
import { Locale, NumberingSystem } from "@stackra/i18n";
import { Bool, List, Map, OneOf, Str } from "@stackra/validation";

/** Locales of the console, read by gen for the `#stackra/i18n` loaders. */
@Config("console.i18n")
export class I18nConfig {
  /** Every locale the console ships. @defaultValue [Locale.En, Locale.Ar] */
  @List(OneOf(Locale)) locales = [Locale.En, Locale.Ar];
  /** The locale of a first visit without a cookie. @defaultValue Locale.En */
  @OneOf(Locale) defaultLocale = Locale.En;
  /** Right-to-left set; gen adds an RTL e2e project per entry. @defaultValue [Locale.Ar] */
  @List(OneOf(Locale)) rtl = [Locale.Ar];
  /** Per-locale fallback chain; a missing key renders the fallback string, never the raw key. */
  @Map(List(OneOf(Locale))) fallbacks: Record<string, Locale[]> = { ar: [Locale.En], en: [] };
  /** Digits used when the tenant has not chosen. @defaultValue NumberingSystem.Latn */
  @OneOf(NumberingSystem) numerals = NumberingSystem.Latn;
  /**
   * Whether the tenant setting may switch Arabic text to Arabic-Indic digits (ADR 0192).
   * @defaultValue true
   */
  @Bool() tenantChoosesNumerals = true;
  /** Fail gen on a namespace that misses a locale instead of warning. @defaultValue true */
  @Bool() failOnMissingLocale = true;
  /** Cookie that remembers the visitor's choice. @defaultValue "locale" */
  @Str() cookieName = "locale";
}
