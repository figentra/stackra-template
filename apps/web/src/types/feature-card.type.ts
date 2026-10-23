/**
 * Stackra file contract:
 * Purpose: one feature card as the feature grid renders it: an icon name, a heading and a line, the
 *          text already in the visitor's language.
 * Boundary: a type shared by the feature grid's Props and the landing page that builds the cards;
 *           the icon is an `IconName`, never SVG markup (a block carries no markup, ADR 0112).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file), ADR 0112
 */
import type { IconName } from "@stackra/icons/contracts";

/** One feature card's content, its text resolved. */
export interface FeatureCard {
  /** A Lucide icon name; decorative, hidden from assistive tech. */
  readonly icon: IconName;
  /** The card heading, already translated. */
  readonly title: string;
  /** One or two sentences. */
  readonly body: string;
}
