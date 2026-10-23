/**
 * Stackra file contract:
 * Purpose: the Props of `LocaleSwitcher`: the current locale, so the select shows it.
 * Boundary: a type only.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { Locale } from "@stackra/i18n";

/** The current locale, so the select shows it. */
export interface LocaleSwitcherProps {
  /** The locale of the page being viewed. */
  readonly locale: Locale;
}
