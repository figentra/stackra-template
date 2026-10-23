/**
 * Stackra file contract:
 * Purpose: the Props of `FeatureGrid`: the heading and the cards, their text already resolved.
 * Boundary: a type only; a card is `FeatureCard` from `types/`.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { FeatureCard } from "#src/types/feature-card.type";

/** Heading and cards. */
export interface FeatureGridProps {
  /** The section heading, already in the visitor's language. */
  readonly title: string;
  /** Rendered in order; the grid is one column on phones, three on desktop. */
  readonly features: readonly FeatureCard[];
}
