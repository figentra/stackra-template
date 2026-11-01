/**
 * Stackra file contract:
 * Purpose: `HeroProps`, what `Hero` draws: the `HeroBlock` fields a landing document gives it.
 * Boundary: type only.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: rule R2, props beside the component);
 *                     ADR 0440 (decision 4).
 */

/** The hero's props. */
export interface HeroProps {
  /** The headline the hero shows. */
  readonly title: string;

  /** The line under it, when the document gives one. */
  readonly subtitle?: string;
}
