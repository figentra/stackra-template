/**
 * Stackra file contract:
 * Purpose: the Props of `SiteHeader`: what the layout knows and the header needs.
 * Boundary: a type only.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { Locale } from "@stackra/i18n";

/** What the layout knows and the header needs. */
export interface SiteHeaderProps {
  /** Shown as the home link's text. */
  readonly siteName: string;
  /** The current locale, for the switcher. */
  readonly locale: Locale;
}
