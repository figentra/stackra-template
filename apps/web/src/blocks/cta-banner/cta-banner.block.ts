/**
 * Stackra file contract:
 * Purpose: the page-builder block `web.cta_banner`: a closing call-to-action banner for tenant
 *          pages.
 * Boundary: the class is the props shape a document may pass, validated on publish and on render;
 *           its renderer is `cta-banner.tsx` in this folder, bound by name, and the key is derived
 *           from the folder. Text is `LocalizedText`, the button a route key.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20, as amended by programming model v3.1,
 *                     AGENTS.md: icon names and client classes), ADR 0110 (registered coded blocks)
 */
import { Block, BlockCategory, type LocalizedText } from "@stackra/experience";
import type { CallToAction } from "#src/schemas/call-to-action.schema";

/** A title, a line and the one button. */
export class CtaBannerBlock extends Block({
  category: BlockCategory.Marketing,
  icon: "megaphone",
}) {
  /** The section heading. */
  title!: LocalizedText;

  /** One sentence under the heading. */
  body!: LocalizedText;

  /** The button's label and the route it opens. */
  button!: CallToAction;
}
