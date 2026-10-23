/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/i18n's configuration: the locales, the regional overlays
 *          and their fallback chains, and how a locale appears in the URL. Gen mounts the route
 *          tree once per locale under its own lowercase prefix (the default unprefixed: `/`,
 *          `/en-us`, `/ar`, `/ar-sa`), adds one RTL e2e project per right-to-left locale and sets
 *          `<html lang dir>`. A regional locale (`ar-SA`, `en-US`) ships only the keys that differ
 *          in `assets/lang/<locale>/`; every other key falls back along its chain.
 * Boundary: an override declares `override` members only and inherits the base's key (`i18n`). The
 *           URL alone selects the locale: the server never redirects an HTML request because of the
 *           cookie or `Accept-Language`, and sends no `Vary`; the cookie only remembers the
 *           visitor's last choice, which the switcher and the locale suggestion banner write in the
 *           browser. The Latin-digit default is the public site's (no tenant choice to defer to,
 *           ADR 0192). Locale codes are BCP 47 (`ar-SA`); URL prefixes are their lowercase form.
 *           Fields typed by an enum restate their type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: the Base alias),
 *                     ADR 0297 (decision 4), ADR 0080, ADR 0192, ADR 0234
 */
import {
  I18nConfig as BaseI18nConfig,
  Locale,
  LocaleUrlStrategy,
  NumberingSystem,
} from "@stackra/i18n";

/** Locales of the site, their fallback chains and how a locale appears in the URL. */
export class I18nConfig extends BaseI18nConfig {
  /** Every locale the site ships: two languages and one regional overlay of each. */
  override locales: Locale[] = [Locale.En, Locale.EnUs, Locale.Ar, Locale.ArSa];

  /** The unprefixed locale. */
  override defaultLocale: Locale = Locale.En;

  /** Right-to-left set; gen adds an RTL e2e project per entry. */
  override rtl: Locale[] = [Locale.Ar, Locale.ArSa];

  /**
   * Per-locale fallback chain, tried in order before the raw key: a regional overlay falls back to
   * its language, then to the default (`ar-SA` → `ar` → `en`). A missing key renders the first
   * fallback string that has it, never the raw key.
   */
  override fallbacks: Record<string, Locale[]> = {
    [Locale.ArSa]: [Locale.Ar, Locale.En],
    [Locale.Ar]: [Locale.En],
    [Locale.EnUs]: [Locale.En],
    [Locale.En]: [],
  };

  /** Digits on the public site. */
  override numerals: NumberingSystem = NumberingSystem.Latn;

  /**
   * `/pricing` for the default locale; every other locale is mounted under its lowercase BCP 47
   * tag: `/en-us/pricing`, `/ar/pricing`, `/ar-sa/pricing`.
   */
  override urlStrategy: LocaleUrlStrategy = LocaleUrlStrategy.PrefixExceptDefault;

  /** Fail gen on a base-language namespace that misses a locale instead of warning. */
  override failOnMissingLocale = true;

  /** Remembers the visitor's last choice in the browser; never read to redirect. */
  override cookieName = "locale";
}
