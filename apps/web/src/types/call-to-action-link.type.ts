/**
 * Stackra file contract:
 * Purpose: a call to action as a renderer receives it: the label, already translated, and the route
 *          key it opens in the visitor's locale mount.
 * Boundary: a type shared by the hero and banner renderers' Props and the landing page; the
 *           document form, with a label per locale, is the `CallToAction` schema.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file), ADR 0110
 */
import type { RouteKey } from "#stackra/routes";

/** A button's text and the route it opens. */
export interface CallToActionLink {
  /** Button text, already translated. */
  readonly label: string;
  /** The route the button opens. */
  readonly route: RouteKey;
}
