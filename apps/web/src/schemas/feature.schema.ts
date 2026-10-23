/**
 * Stackra file contract:
 * Purpose: one feature card inside the `web.feature_grid` block's props: an icon, a title and a
 *          line.
 * Boundary: a shape class nested in the block's props; the icon is an `Icons` case, never SVG
 *           markup (a block carries no markup, ADR 0112).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 8), ADR 0110 d6, ADR 0112
 */
import type { LocalizedText } from "@stackra/experience";
import type { Icons } from "@stackra/ui/icons";
import { Schema } from "@stackra/validation";

/** An icon, a heading and one or two sentences, each text one value per locale. */
export class Feature extends Schema {
  /** An `Icons` case; decorative, hidden from assistive tech. */
  icon!: Icons;

  /** The card heading. */
  title!: LocalizedText;

  /** One or two sentences. */
  body!: LocalizedText;
}
