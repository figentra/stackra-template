/**
 * Stackra file contract:
 * Purpose: the Props of `CtaBanner`: the copy, already in the visitor's language, and the one
 *          action.
 * Boundary: a type only; the document form of the same block is `CtaBannerBlock`.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { CallToActionLink } from "#src/types/call-to-action-link.type";

/** Copy and the one action. */
export interface CtaBannerProps {
  /** The section heading, already in the visitor's language. */
  readonly title: string;
  /** One sentence under the heading. */
  readonly body: string;
  /** The button's label and the route it opens. */
  readonly button: CallToActionLink;
}
