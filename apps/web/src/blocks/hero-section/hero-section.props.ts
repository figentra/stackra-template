/**
 * Stackra file contract:
 * Purpose: the Props of `HeroSection`: the headline, the line under it and the actions, as plain
 *          strings.
 * Boundary: a type only; the document form of the same block is `HeroSectionBlock`.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { CallToActionLink } from "#src/types/call-to-action-link.type";

/** Copy and actions of the hero. */
export interface HeroSectionProps {
  /** The page's h1. */
  readonly title: string;
  /** One sentence under the title. */
  readonly subtitle: string;
  /** The filled button. */
  readonly cta: CallToActionLink;
  /** An outline button beside it. */
  readonly secondary?: CallToActionLink;
}
