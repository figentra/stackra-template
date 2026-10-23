/**
 * Stackra file contract:
 * Purpose: what `useLocaleSuggestion` returns: the shipped locale the browser prefers, if any, and
 *          the visitor's two answers.
 * Boundary: a type shared by the hook that builds it and the locale suggestion banner that renders
 *           it; the remembered choice is i18n's.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: a hook's result in
 *                     types/), ADR 0297 (decision 4)
 */
import type { Locale } from "@stackra/i18n";

/** What the banner renders and does. */
export interface LocaleSuggestionState {
  /** The locale to offer; null when there is nothing to offer. */
  readonly suggested: Locale | null;
  /** Records the suggested locale as the visitor's choice and opens the same page in it. */
  readonly accept: () => void;
  /** Records the current locale as the visitor's choice; the banner hides for good. */
  readonly dismiss: () => void;
}
