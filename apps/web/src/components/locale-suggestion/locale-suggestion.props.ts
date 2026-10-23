/**
 * Stackra file contract:
 * Purpose: the Props of `LocaleSuggestion`: the locale of the page being viewed.
 * Boundary: a type only.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { Locale } from "@stackra/i18n";

/** The locale of the page being viewed. */
export interface LocaleSuggestionProps {
  /** The current locale mount. */
  readonly locale: Locale;
}
