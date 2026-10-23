/**
 * Stackra file contract:
 * Purpose: the Props of `SiteFooter`: what the footer shows beyond its keys.
 * Boundary: a type only.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */

/** What the footer shows beyond its keys. */
export interface SiteFooterProps {
  /** The site's name in the rights line. */
  readonly siteName: string;
}
